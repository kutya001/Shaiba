<template>
  <div class="flex flex-col items-center justify-between h-full bg-slate-950 text-white p-4 select-none relative">
    <!-- Screen statistics: Coins, Fuel, Distance -->
    <div class="w-full space-y-2 mb-2">
      <!-- Fuel and Distance indicators -->
      <div class="grid grid-cols-3 gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-inner text-center">
        <div>
          <span class="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Дистанция</span>
          <span class="text-base font-extrabold font-mono text-cyan-400">{{ Math.floor(distance) }}м</span>
        </div>
        <div>
          <span class="block text-[8px] font-black text-amber-500 uppercase tracking-widest mb-0.5">Монеты</span>
          <span class="text-base font-extrabold font-mono text-amber-400">
            <i class="bi bi-coin text-amber-500 mr-1"></i>{{ coins }}
          </span>
        </div>
        <div>
          <span class="block text-[8px] font-black text-rose-500 uppercase tracking-widest mb-0.5">Рекорд</span>
          <span class="text-base font-extrabold font-mono text-indigo-400">{{ highscore }}м</span>
        </div>
      </div>

      <!-- Fuel bar progression -->
      <div class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 flex items-center gap-2">
        <i class="bi bi-fuel-pump-fill text-rose-500 text-xs animate-pulse"></i>
        <div class="flex-grow bg-slate-950 rounded-lg h-3 overflow-hidden border border-slate-800 p-[1px]">
          <div
            class="h-full rounded-md transition-all duration-100"
            :class="fuel > 30 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-red-500 animate-pulse'"
            :style="{ width: fuel + '%' }"
          ></div>
        </div>
        <span class="text-[9px] font-black font-mono" :class="fuel > 30 ? 'text-emerald-400' : 'text-red-500 font-bold'">
          {{ Math.round(fuel) }}%
        </span>
      </div>
    </div>

    <!-- Active Physics drawing Canvas wrapper -->
    <div class="flex-grow w-full max-w-lg flex items-center justify-center relative my-1">
      <canvas
        ref="physicsCanvas"
        class="border-2 border-slate-800 rounded-3xl bg-sky-950/20 shadow-2xl w-full"
        width="480"
        height="260"
        style="aspect-ratio: 48/26;"
      ></canvas>

      <!-- Game Over overlay panel -->
      <div
        v-if="gameOver"
        class="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20"
      >
        <div class="w-14 h-14 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center text-red-500 mb-4 animate-bounce">
          <i class="bi bi-fire text-2xl"></i>
        </div>
        <h2 class="text-xl font-black text-white mb-1 tracking-tight font-heading uppercase">
          {{ crashReason || 'АВАРИЯ!' }}
        </h2>
        <p class="text-xs font-semibold text-slate-400 mb-4">
          Дистанция: <span class="text-cyan-400 font-bold font-mono">{{ Math.floor(distance) }}м</span> | Монеточки: <span class="text-amber-400 font-bold font-mono">{{ coins }}</span>
        </p>
        <button
          @click="restartGame"
          class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition border-none shadow-md shadow-indigo-505/35 cursor-pointer active:scale-95"
        >
          Попробовать снова
        </button>
      </div>

      <!-- Welcome controls overlay screen -->
      <div
        v-if="!hasStarted && !gameOver"
        class="absolute inset-0 bg-slate-950/80 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20"
      >
        <div class="w-14 h-14 bg-indigo-500/10 border border-indigo-500/25 rounded-full flex items-center justify-center text-indigo-400 mb-4">
          <i class="bi bi-bicycle text-2xl"></i>
        </div>
        <h2 class="text-lg font-black text-white mb-2 font-heading uppercase">
          Hill Climb Moto
        </h2>
        <p class="text-[10px] font-semibold text-slate-400 max-w-[240px] mb-5 leading-relaxed">
          Управляйте мотоциклом по неровным холмам Бишкека! Собирайте бензин и монеты, не перевернитесь!
        </p>
        <button
          @click="startGame"
          class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition border-none shadow-md shadow-indigo-505/45 cursor-pointer active:scale-95"
        >
          ПОЕХАЛИ!
        </button>
      </div>
    </div>

    <!-- Moto Controls: BRAKE & GAS button panels optimized for both hand thumbs -->
    <div class="w-full shrink-0 grid grid-cols-2 gap-4 mt-2 select-none">
      <!-- LEFTHAND: BRAKE / ROTATE LEFT -->
      <button
        @mousedown="setBrake(true)"
        @mouseup="setBrake(false)"
        @mouseleave="setBrake(false)"
        @touchstart.prevent="setBrake(true)"
        @touchend.prevent="setBrake(false)"
        type="button"
        class="h-16 bg-slate-900 border-2 border-red-500/20 active:bg-red-500/20 rounded-2xl flex flex-col items-center justify-center gap-1 transition cursor-pointer"
      >
        <span class="text-[11px] font-black uppercase tracking-wider text-red-400">Тормоз</span>
        <span class="text-[9px] font-bold text-slate-500 uppercase">Наклон <i class="bi bi-rotate-ccw"></i></span>
      </button>

      <!-- RIGHTHAND: GAS / ROTATE RIGHT -->
      <button
        @mousedown="setGas(true)"
        @mouseup="setGas(false)"
        @mouseleave="setGas(false)"
        @touchstart.prevent="setGas(true)"
        @touchend.prevent="setGas(false)"
        type="button"
        class="h-16 bg-slate-900 border-2 border-emerald-500/20 active:bg-emerald-500/20 rounded-2xl flex flex-col items-center justify-center gap-1 transition cursor-pointer"
      >
        <span class="text-[11px] font-black uppercase tracking-wider text-emerald-400">Газ</span>
        <span class="text-[9px] font-bold text-slate-500 uppercase">Наклон <i class="bi bi-rotate-cw"></i></span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      distance: 0,
      coins: 0,
      fuel: 100,
      highscore: Number(localStorage.getItem("game_hillclimb_highscore")) || 0,
      gameOver: false,
      hasStarted: false,
      crashReason: "",
      
      // Controls pressed states
      isGasPressed: false,
      isBrakePressed: false,

      // Bike physics variables
      bike: {
        x: 60,
        y: 120,
        vx: 0,
        vy: 0,
        angle: 0,          // Angle of chassis
        angularVelocity: 0,
        length: 30,        // Distance between axles
        height: 15,        // Suspension offset
      },
      
      // Procedural elements lists
      coinsList: [],
      fuelsList: [],
      animationFrameId: null,
    };
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    this.drawInitial();
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  },
  methods: {
    setGas(val) {
      this.isGasPressed = val;
    },
    setBrake(val) {
      this.isBrakePressed = val;
    },
    drawInitial() {
      const canvas = this.$refs.physicsCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      
      // Smooth visual horizon sky gradient background draw
      ctx.fillStyle = "#0c122c";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Simple ground drawing
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let x = 0; x <= canvas.width; x += 10) {
        ctx.lineTo(x, this.getTerrainY(x));
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.fill();
    },
    getTerrainY(x) {
      if (x < 60) return 180; // Secure flat starting area
      
      // Progressive procedurally generated high quality sinus hills mapping
      let h = 180;
      h += Math.sin(x * 0.007) * 45;
      h += Math.sin(x * 0.022) * 12;
      h += Math.cos(x * 0.0031) * 20;
      return h;
    },
    startGame() {
      this.hasStarted = true;
      this.gameOver = false;
      this.distance = 0;
      this.coins = 0;
      this.fuel = 100;
      this.crashReason = "";
      
      // Initialize vehicle state
      this.bike = {
        x: 60,
        y: 130,
        vx: 0,
        vy: 0,
        angle: 0,
        angularVelocity: 0,
        length: 30,
        height: 15,
      };

      // Spawn procedural objects
      this.generateSectors();

      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      this.tick();
    },
    restartGame() {
      this.startGame();
    },
    generateSectors() {
      this.coinsList = [];
      this.fuelsList = [];
      
      // Spawns items starting at x=150 up to x=500000 plus
      for (let x = 180; x < 50000; x += 140) {
        if (x % 560 === 0) {
          // Sponsor Fuel canisters every 560px
          this.fuelsList.push({ x: x, y: this.getTerrainY(x) - 18, collected: false });
        } else {
          // Collectable Coins elsewhere
          this.coinsList.push({ x: x, y: this.getTerrainY(x) - 12, collected: false });
        }
      }
    },
    tick() {
      if (this.gameOver) return;

      this.updatePhysics();
      this.draw();

      this.animationFrameId = requestAnimationFrame(this.tick);
    },
    updatePhysics() {
      // 1. Drain general Fuel levels over ticks
      this.fuel -= 0.09;
      if (this.fuel <= 0) {
        this.fuel = 0;
        this.endGame("Закончилось топливо!");
        return;
      }

      // 2. Chassis gravity force pull
      const gravity = 0.16;
      this.bike.vy += gravity;

      // 3. Speed accelerations depending on input controls
      const gasForce = 0.15;
      const tiltRate = 0.006;
      
      if (this.isGasPressed) {
        // Accelerate bike forward
        this.bike.vx += gasForce * Math.cos(this.bike.angle);
        this.bike.vy += gasForce * Math.sin(this.bike.angle);
        // Rotation torque (leans motor backwards, i.e. elevates front)
        this.bike.angularVelocity += tiltRate;
      }
      
      if (this.isBrakePressed) {
        // Apply heavy retardation
        this.bike.vx *= 0.94;
        // Front tilt down rotation torque
        this.bike.angularVelocity -= tiltRate;
      }

      // Air resistance / General friction drag dampening
      this.bike.vx *= 0.985;
      this.bike.vy *= 0.985;
      this.bike.angularVelocity *= 0.92; // Rotational decay

      // Update spatial coordinates
      this.bike.x += this.bike.vx;
      this.bike.y += this.bike.vy;
      this.bike.angle += this.bike.angularVelocity;

      // Bike chassis metrics length offsets
      const backX = this.bike.x - this.bike.length / 2 * Math.cos(this.bike.angle);
      const backY = this.bike.y - this.bike.length / 2 * Math.sin(this.bike.angle);
      
      const frontX = this.bike.x + this.bike.length / 2 * Math.cos(this.bike.angle);
      const frontY = this.bike.y + this.bike.length / 2 * Math.sin(this.bike.angle);

      // Solve wheel contact boundaries against Procedural Terrain Height Map
      const terrBackY = this.getTerrainY(backX);
      const terrFrontY = this.getTerrainY(frontX);

      let backWheelContact = false;
      let frontWheelContact = false;

      // Elastic Collision response: Back Wheel
      if (backY >= terrBackY - 8) {
        // Wheel hits ground, correct chassis positions and adjust velocities
        backWheelContact = true;
        const depth = backY - (terrBackY - 8);
        this.bike.y -= depth * 0.5 * Math.cos(this.bike.angle);
        this.bike.vy -= depth * 0.15;
        
        // Push velocity forwards on slope
        const slopeAngle = Math.atan2(terrBackY - this.getTerrainY(backX - 5), 5);
        this.bike.vx += Math.cos(slopeAngle) * 0.08;
      }

      // Elastic Collision response: Front Wheel
      if (frontY >= terrFrontY - 8) {
        frontWheelContact = true;
        const depth = frontY - (terrFrontY - 8);
        this.bike.y -= depth * 0.5 * Math.cos(this.bike.angle);
        this.bike.vy -= depth * 0.15;
      }

      // If both wheels contact ground: reconcile correct alignment orientation
      if (backWheelContact && frontWheelContact) {
        const targetAngle = Math.atan2(terrFrontY - terrBackY, this.bike.length);
        this.bike.angle = this.bike.angle * 0.7 + targetAngle * 0.3; // Align to landscape nicely
        this.bike.angularVelocity *= 0.5;
      }

      // 4. Distance record calculation updates
      const runDistance = this.bike.x / 10;
      if (runDistance > this.distance) {
        this.distance = runDistance;
        if (this.distance > this.highscore) {
          this.highscore = Math.floor(this.distance);
          localStorage.setItem("game_hillclimb_highscore", this.highscore);
        }
      }

      // 5. Crash detection validation (Overturned motor head impact or steep critical rotation)
      const absAngleDeg = Math.abs(this.bike.angle * 57.29) % 360;
      if ((absAngleDeg > 110 && absAngleDeg < 250) && (backWheelContact || frontWheelContact)) {
        this.endGame("Мотоцикл перевернулся!");
        return;
      }

      // Double check center chassis crash against terrain
      if (this.bike.y >= this.getTerrainY(this.bike.x) - 5) {
        this.endGame("Мотоциклист вылетел!");
        return;
      }

      // 6. Object overlap items collection hits
      this.coinsList.forEach(coin => {
        if (!coin.collected && Math.abs(this.bike.x - coin.x) < 22 && Math.abs(this.bike.y - coin.y) < 24) {
          coin.collected = true;
          this.coins += 1;
        }
      });

      this.fuelsList.forEach(fuelCan => {
        if (!fuelCan.collected && Math.abs(this.bike.x - fuelCan.x) < 22 && Math.abs(this.bike.y - fuelCan.y) < 24) {
          fuelCan.collected = true;
          this.fuel = Math.min(100, this.fuel + 60); // Refills 60% fuel capacity
        }
      });
    },
    draw() {
      const canvas = this.$refs.physicsCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      // 1. Clear background viewport and fill sky gradient
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save canvas state before camera panning transforms
      ctx.save();
      
      // Camera camera follow tracking x offsets
      const cameraX = this.bike.x - 120;
      ctx.translate(-cameraX, 0);

      // 2. Draw procedural terrain landscape curves
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      const startX = Math.max(0, cameraX - 40);
      const endX = cameraX + canvas.width + 40;
      
      ctx.moveTo(startX, canvas.height);
      for (let tx = startX; tx <= endX; tx += 6) {
        ctx.lineTo(tx, this.getTerrainY(tx));
      }
      ctx.lineTo(endX, canvas.height);
      ctx.fill();

      // Grass strip / green glowing upper outline border
      ctx.strokeStyle = "#4f46e5";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let tx = startX; tx <= endX; tx += 6) {
        if (tx === startX) ctx.moveTo(tx, this.getTerrainY(tx));
        else ctx.lineTo(tx, this.getTerrainY(tx));
      }
      ctx.stroke();

      // 3. Draw collectable Coins on screen
      ctx.shadowBlur = 4;
      ctx.lineWidth = 1;
      this.coinsList.forEach(coin => {
        if (!coin.collected && coin.x > cameraX - 20 && coin.x < cameraX + canvas.width + 20) {
          ctx.strokeStyle = "#fbbf24";
          ctx.shadowColor = "#f59e0b";
          ctx.fillStyle = "#fbbf24";
          
          ctx.beginPath();
          ctx.arc(coin.x, coin.y, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      });

      // 4. Draw Gas Refuel canisters
      this.fuelsList.forEach(fuelCan => {
        if (!fuelCan.collected && fuelCan.x > cameraX - 20 && fuelCan.x < cameraX + canvas.width + 20) {
          ctx.shadowColor = "#ef4444";
          ctx.fillStyle = "#ef4444";
          ctx.fillRect(fuelCan.x - 5, fuelCan.y - 8, 10, 14);
          // Can handle lid notch
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(fuelCan.x - 3, fuelCan.y - 10, 6, 2);
          
          // Render gas text
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 6px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("GAS", fuelCan.x, fuelCan.y);
        }
      });
      ctx.shadowBlur = 0; // Disable shadow glow

      // 5. Draw Motorcycle with suspension axles and wheels
      ctx.save();
      // Translate to bike center positions
      ctx.translate(this.bike.x, this.bike.y);
      ctx.rotate(this.bike.angle);

      // Back Suspension Frame line
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-this.bike.length / 2, 4);
      ctx.stroke();

      // Front steering fork line
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(this.bike.length / 2, 4);
      ctx.stroke();

      // Horizontal chassis plate body of bike
      ctx.strokeStyle = "#4f46e5";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-12, -4);
      ctx.lineTo(12, -4);
      ctx.stroke();

      // Stylized bike engine case
      ctx.fillStyle = "#94a3b8";
      ctx.beginPath();
      ctx.roundRect(-6, -2, 11, 7, 2);
      ctx.fill();

      // Stylized driver helmet head
      ctx.fillStyle = "#f43f5e";
      ctx.beginPath();
      ctx.arc(0, -18, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Driver body frame
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -13);
      ctx.lineTo(-4, -6); // Torso to seat
      ctx.stroke();

      // Back wheel drawing (wx = -length/2)
      ctx.save();
      ctx.translate(-this.bike.length / 2, 4);
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 3;
      ctx.fillStyle = "#475569";
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Draw spokes lines to see rolling rotate loops
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.lineTo(7, 0);
      ctx.moveTo(0, -7);
      ctx.lineTo(0, 7);
      ctx.stroke();
      ctx.restore();

      // Front wheel drawing (wx = length/2)
      ctx.save();
      ctx.translate(this.bike.length / 2, 4);
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 3;
      ctx.fillStyle = "#475569";
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Draw front wheel spokes lines
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.lineTo(7, 0);
      ctx.moveTo(0, -7);
      ctx.lineTo(0, 7);
      ctx.stroke();
      ctx.restore();

      ctx.restore(); // Restore bike center transform

      ctx.restore(); // Restore camera translation state
    },
    endGame(reason) {
      this.gameOver = true;
      this.crashReason = reason || "Авария!";
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    },
    handleKeyDown(event) {
      if (!this.hasStarted || this.gameOver) return;
      if (event.code === "ArrowRight" || event.code === "KeyD" || event.code === "Space") {
        this.isGasPressed = true;
      }
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        this.isBrakePressed = true;
      }
    },
    handleKeyUp(event) {
      if (event.code === "ArrowRight" || event.code === "KeyD" || event.code === "Space") {
        this.isGasPressed = false;
      }
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        this.isBrakePressed = false;
      }
    }
  }
};
</script>
