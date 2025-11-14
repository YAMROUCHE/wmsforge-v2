/**
 * Tests automatisés pour les 3 features enterprise
 * TOP 1: Wave Management
 * TOP 2: Task Management
 * TOP 3: Labor Management
 */

import { waveEngine, WaveConfig } from '../src/utils/waveEngine';
import { taskEngine, Task, Operator } from '../src/utils/taskEngine';
import { laborEngine, OperatorPerformance } from '../src/utils/laborEngine';

// ===========================
// TEST 1: WAVE MANAGEMENT
// ===========================

console.log('\n🌊 TEST 1: WAVE MANAGEMENT\n' + '='.repeat(50));

// Données de test : 50 commandes
const testOrders = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  customer_name: `Client ${i + 1}`,
  status: 'pending',
  priority: i < 5 ? 'urgent' : i < 15 ? 'high' : 'normal',
  shipping_method: i < 10 ? 'express' : 'standard',
  created_at: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
  total_amount: Math.random() * 1000 + 50,
  items: [
    {
      product_id: Math.floor(Math.random() * 100) + 1,
      product_name: `Produit ${Math.floor(Math.random() * 100)}`,
      quantity: Math.floor(Math.random() * 10) + 1,
      location: `${['A', 'B', 'C'][Math.floor(Math.random() * 3)]}-01-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`,
    },
    {
      product_id: Math.floor(Math.random() * 100) + 1,
      product_name: `Produit ${Math.floor(Math.random() * 100)}`,
      quantity: Math.floor(Math.random() * 5) + 1,
      location: `${['A', 'B', 'C'][Math.floor(Math.random() * 3)]}-02-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`,
    },
  ],
}));

console.log(`📦 Commandes en attente: ${testOrders.length}`);

// Configuration de vague optimale
const waveConfig: WaveConfig = {
  max_orders_per_wave: 10,
  max_lines_per_wave: 30,
  max_time_per_wave_minutes: 120,
  group_by_priority: true,
  group_by_zone: true,
  group_by_shipping: true,
};

// Générer les vagues
const waves = waveEngine.generateWaves(testOrders, waveConfig);

console.log(`✅ Vagues générées: ${waves.length}`);
console.log('\nDétail des vagues:');
waves.forEach((wave, idx) => {
  console.log(`  ${idx + 1}. ${wave.name}`);
  console.log(`     - Priorité: ${wave.priority}`);
  console.log(`     - Statut: ${wave.status}`);
  console.log(`     - Zone: ${wave.zone || 'Multiple'}`);
  console.log(`     - Commandes: ${wave.metrics.total_orders}`);
  console.log(`     - Lignes: ${wave.metrics.total_lines}`);
  console.log(`     - Temps estimé: ${wave.metrics.estimated_time_minutes} min`);
});

// Vérifications
const test1Passed =
  waves.length > 0 &&
  waves.every(w => w.metrics.total_orders <= waveConfig.max_orders_per_wave) &&
  waves.every(w => w.metrics.total_lines <= waveConfig.max_lines_per_wave);

console.log(`\n${test1Passed ? '✅' : '❌'} TEST 1: ${test1Passed ? 'RÉUSSI' : 'ÉCHOUÉ'}`);

// ===========================
// TEST 2: TASK MANAGEMENT
// ===========================

console.log('\n\n📋 TEST 2: TASK MANAGEMENT (avec INTERLEAVING)\n' + '='.repeat(50));

// Générer des tâches à partir de la première vague
const firstWave = waves[0];
const tasks = taskEngine.generateTasks(firstWave.orders, firstWave.id);

console.log(`✅ Tâches générées: ${tasks.length}`);
console.log(`   - Pick: ${tasks.filter(t => t.type === 'pick').length}`);
console.log(`   - Put Away: ${tasks.filter(t => t.type === 'put_away').length}`);

// Créer des opérateurs de test
const operators: Operator[] = [
  {
    id: 'op-001',
    name: 'Jean Dupont',
    current_zone: 'A',
    status: 'available',
    assigned_tasks: [],
    completed_today: 15,
    productivity_score: 35,
  },
  {
    id: 'op-002',
    name: 'Marie Martin',
    current_zone: 'B',
    status: 'available',
    assigned_tasks: [],
    completed_today: 20,
    productivity_score: 42,
  },
  {
    id: 'op-003',
    name: 'Pierre Dubois',
    current_zone: 'C',
    status: 'available',
    assigned_tasks: [],
    completed_today: 18,
    productivity_score: 38,
  },
];

console.log(`\n👷 Opérateurs disponibles: ${operators.length}`);
operators.forEach(op => {
  console.log(`  - ${op.name} (Zone ${op.current_zone}, ${op.productivity_score} picks/h)`);
});

// Assigner tâches AVEC interleaving
console.log('\n🔀 Test INTERLEAVING activé...');
const assignmentsWithInterleaving = taskEngine.assignTasks(tasks, operators, true);

console.log('✅ Assignation avec interleaving:');
assignmentsWithInterleaving.forEach((tasks, opId) => {
  const op = operators.find(o => o.id === opId);
  console.log(`  ${op?.name}: ${tasks.length} tâches`);

  // Vérifier si interleaving a fonctionné
  let interleavingCount = 0;
  for (let i = 0; i < tasks.length - 1; i++) {
    if (tasks[i].type === 'pick' && tasks[i + 1].type === 'put_away' && tasks[i].zone === tasks[i + 1].zone) {
      interleavingCount++;
    }
  }
  if (interleavingCount > 0) {
    console.log(`    🎯 ${interleavingCount} opportunité(s) d'interleaving trouvée(s)!`);
  }
});

// Test SANS interleaving pour comparaison
const assignmentsWithoutInterleaving = taskEngine.assignTasks(
  tasks.map(t => ({ ...t, status: 'pending', assigned_to: undefined })),
  operators,
  false
);

const test2Passed = assignmentsWithInterleaving.size > 0;
console.log(`\n${test2Passed ? '✅' : '❌'} TEST 2: ${test2Passed ? 'RÉUSSI' : 'ÉCHOUÉ'}`);

// ===========================
// TEST 3: LABOR MANAGEMENT
// ===========================

console.log('\n\n🏆 TEST 3: LABOR MANAGEMENT (Gamification)\n' + '='.repeat(50));

// Simuler des tâches complétées pour chaque opérateur
const completedTasks: Task[] = [];

operators.forEach((op, idx) => {
  // Nombre différent de tâches par opérateur pour créer de la variance
  const numTasks = 30 + idx * 15; // 30, 45, 60 tâches

  for (let i = 0; i < numTasks; i++) {
    const task: Task = {
      id: `completed-${op.id}-${i}`,
      type: 'pick',
      priority: 'normal',
      status: 'completed',
      product_name: `Produit ${i}`,
      product_id: i,
      quantity: Math.floor(Math.random() * 5) + 1,
      from_location: 'A-01-01',
      to_location: 'STAGING',
      assigned_to: op.id,
      created_at: new Date(Date.now() - 8 * 3600000),
      started_at: new Date(Date.now() - 7 * 3600000 + i * 60000),
      completed_at: new Date(Date.now() - 7 * 3600000 + i * 60000 + 30000),
      estimated_time_seconds: 30,
      actual_time_seconds: 25 + Math.random() * 10, // 25-35s
    };
    completedTasks.push(task);
  }
});

console.log(`✅ Tâches complétées simulées: ${completedTasks.length}`);

// Calculer les performances
const performances: OperatorPerformance[] = operators.map(op => {
  const opTasks = completedTasks.filter(t => t.assigned_to === op.id);
  return laborEngine.calculatePerformance(op, opTasks);
});

console.log('\n📊 Performances calculées:');
performances.forEach((perf, idx) => {
  console.log(`\n  ${idx + 1}. ${perf.operator_name}`);
  console.log(`     - Score quotidien: ${perf.daily_score} pts`);
  console.log(`     - Picks/heure: ${perf.picks_per_hour}`);
  console.log(`     - Précision: ${perf.accuracy_rate}%`);
  console.log(`     - Efficacité: ${perf.efficiency_score}%`);
  console.log(`     - Tâches complétées: ${perf.tasks_completed}`);
  console.log(`     - Badges gagnés: ${perf.badges_earned.length}`);

  if (perf.badges_earned.length > 0) {
    console.log(`     - Badges: ${perf.badges_earned.map(b => `${b.icon} ${b.name}`).join(', ')}`);
  }
});

// Générer le leaderboard
const leaderboard = laborEngine.generateLeaderboard(performances);

console.log('\n🏅 LEADERBOARD:');
leaderboard.forEach(entry => {
  const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`;
  console.log(`  ${medal} ${entry.operator_name} - ${entry.score} pts (${entry.picks_per_hour} picks/h, ${entry.accuracy_rate}% précision)`);
});

// Stats d'équipe
const teamStats = laborEngine.calculateTeamStats(performances);

console.log('\n👥 STATISTIQUES D\'ÉQUIPE:');
console.log(`  - Opérateurs actifs: ${teamStats.total_operators}`);
console.log(`  - Total picks: ${teamStats.total_picks}`);
console.log(`  - Moyenne picks/h: ${teamStats.avg_picks_per_hour}`);
console.log(`  - Moyenne précision: ${teamStats.avg_accuracy}%`);
console.log(`  - Moyenne efficacité: ${teamStats.avg_efficiency}%`);
console.log(`  - Total badges: ${teamStats.total_badges}`);

const test3Passed =
  performances.length === operators.length &&
  leaderboard.length === operators.length &&
  leaderboard[0].rank === 1 &&
  teamStats.total_picks > 0;

console.log(`\n${test3Passed ? '✅' : '❌'} TEST 3: ${test3Passed ? 'RÉUSSI' : 'ÉCHOUÉ'}`);

// ===========================
// RÉSUMÉ FINAL
// ===========================

console.log('\n\n' + '='.repeat(50));
console.log('📊 RÉSUMÉ DES TESTS');
console.log('='.repeat(50));

const allTestsPassed = test1Passed && test2Passed && test3Passed;

console.log(`\n1. Wave Management: ${test1Passed ? '✅ RÉUSSI' : '❌ ÉCHOUÉ'}`);
console.log(`2. Task Management: ${test2Passed ? '✅ RÉUSSI' : '❌ ÉCHOUÉ'}`);
console.log(`3. Labor Management: ${test3Passed ? '✅ RÉUSSI' : '❌ ÉCHOUÉ'}`);

console.log('\n' + '='.repeat(50));
console.log(allTestsPassed ? '✅ TOUS LES TESTS RÉUSSIS! 🎉' : '❌ CERTAINS TESTS ONT ÉCHOUÉ');
console.log('='.repeat(50) + '\n');

// Export des résultats
export const testResults = {
  wave_management: test1Passed,
  task_management: test2Passed,
  labor_management: test3Passed,
  all_passed: allTestsPassed,
  waves_generated: waves.length,
  tasks_generated: tasks.length,
  operators_tested: operators.length,
  badges_earned: performances.reduce((sum, p) => sum + p.badges_earned.length, 0),
};
