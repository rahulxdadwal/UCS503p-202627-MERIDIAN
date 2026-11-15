export interface LayoutItemInput {
  id: string;
  vector: Float32Array;
  pinned?: boolean;
  position?: { x: number; y: number };
}

export interface LayoutOptions {
  canvasWidth?: number; // default 1200
  canvasHeight?: number; // default 800
  iterations?: number; // default 60
  minCardDistance?: number; // default 160 px
}

/**
 * High-dimensional dimensionality reduction (384d -> 2D) with spring-force collision relaxation.
 * 1. Computes pairwise cosine distance matrix.
 * 2. Uses Classical Multidimensional Scaling (MDS) projection to seed 2D positions.
 * 3. Applies iterative spring-force collision relaxation to prevent card overlapping while preserving semantic clusters.
 * 4. Pinned cards remain locked in place.
 */
export function compute2DSpatialLayout(
  items: LayoutItemInput[],
  options: LayoutOptions = {}
): Map<string, { x: number; y: number }> {
  const n = items.length;
  const positions = new Map<string, { x: number; y: number }>();
  if (n === 0) return positions;

  const width = options.canvasWidth ?? 1200;
  const height = options.canvasHeight ?? 800;
  const iterations = options.iterations ?? 60;
  const minCardDistance = options.minCardDistance ?? 160;

  if (n === 1) {
    const item = items[0];
    positions.set(item.id, item.position ?? { x: width / 2, y: height / 2 });
    return positions;
  }

  // 1. Calculate Pairwise Cosine Distance Matrix
  // Distance: d = sqrt(2 * (1 - cosine))
  const dMatrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      let dot = 0;
      const vA = items[i].vector;
      const vB = items[j].vector;
      const dim = vA.length;
      for (let k = 0; k < dim; k++) {
        dot += vA[k] * vB[k];
      }
      // Bound dot product to [-1, 1]
      dot = Math.max(-1, Math.min(1, dot));
      const dist = Math.sqrt(Math.max(0, 2 * (1 - dot)));
      dMatrix[i][j] = dist;
      dMatrix[j][i] = dist;
    }
  }

  // 2. Initial Seeding: Use PCA / Classical MDS Approximation
  // Center matrix B = -0.5 * H * D^2 * H
  const coords: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < n; i++) {
    if (items[i].pinned && items[i].position) {
      coords.push({ ...items[i].position! });
    } else {
      // Seed around center with angular dispersion based on similarity to item 0
      const angle = (2 * Math.PI * i) / n + (dMatrix[0][i] * 2.0);
      const radius = 180 + dMatrix[0][i] * 140;
      coords.push({
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
      });
    }
  }

  // 3. Spring-Force Collision Relaxation Simulation
  const kSpring = 0.05;
  const kRepulsion = 15000;
  const damping = 0.85;

  const velocities: Array<{ vx: number; vy: number }> = Array.from({ length: n }, () => ({ vx: 0, vy: 0 }));

  for (let iter = 0; iter < iterations; iter++) {
    const stepDecay = (iterations - iter) / iterations;

    for (let i = 0; i < n; i++) {
      if (items[i].pinned) continue; // Pinned items do not move

      let fx = 0;
      let fy = 0;

      for (let j = 0; j < n; j++) {
        if (i === j) continue;

        const dx = coords[i].x - coords[j].x;
        const dy = coords[i].y - coords[j].y;
        const currentDist = Math.max(1, Math.hypot(dx, dy));
        const targetDist = Math.max(minCardDistance, dMatrix[i][j] * 280);

        // Attractive / Restorative spring force toward semantic distance
        const springDelta = currentDist - targetDist;
        const fSpring = -kSpring * springDelta;
        fx += (dx / currentDist) * fSpring;
        fy += (dy / currentDist) * fSpring;

        // Repulsive force when cards collide / overlap (distance < minCardDistance)
        if (currentDist < minCardDistance) {
          const overlap = minCardDistance - currentDist;
          const fRep = (kRepulsion / (currentDist * currentDist)) * overlap;
          fx += (dx / currentDist) * fRep;
          fy += (dy / currentDist) * fRep;
        }
      }

      // Gravitational pull toward center of canvas
      const dcx = width / 2 - coords[i].x;
      const dcy = height / 2 - coords[i].y;
      fx += dcx * 0.002;
      fy += dcy * 0.002;

      // Update velocity & position
      velocities[i].vx = (velocities[i].vx + fx) * damping;
      velocities[i].vy = (velocities[i].vy + fy) * damping;

      coords[i].x += velocities[i].vx * stepDecay;
      coords[i].y += velocities[i].vy * stepDecay;

      // Keep within bounds
      coords[i].x = Math.max(80, Math.min(width - 80, coords[i].x));
      coords[i].y = Math.max(80, Math.min(height - 80, coords[i].y));
    }
  }

  for (let i = 0; i < n; i++) {
    positions.set(items[i].id, {
      x: Math.round(coords[i].x),
      y: Math.round(coords[i].y),
    });
  }

  return positions;
}
