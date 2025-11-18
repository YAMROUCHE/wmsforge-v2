import { useState } from 'react';
import { Play, CheckCircle, XCircle, Loader } from 'lucide-react';
import WaveManagementPanel from '../components/WaveManagementPanel';
import TaskManagementPanel from '../components/TaskManagementPanel';
import LaborManagementPanel from '../components/LaborManagementPanel';
import { waveEngine, Wave, Order } from '../utils/waveEngine';
import { taskEngine, Task, Operator, TaskMetrics } from '../utils/taskEngine';
import { laborEngine, OperatorPerformance, LeaderboardEntry } from '../utils/laborEngine';

export default function EnterpriseTest() {
  const [testResults, setTestResults] = useState<{
    wave: boolean | null;
    task: boolean | null;
    labor: boolean | null;
  }>({ wave: null, task: null, labor: null });

  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  // État des données de test
  const [waves, setWaves] = useState<Wave[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [performances, setPerformances] = useState<OperatorPerformance[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [taskMetrics, setTaskMetrics] = useState<TaskMetrics | undefined>();
  const [teamStats, setTeamStats] = useState<any>();

  const [testLogs, setTestLogs] = useState<string[]>([]);

  const log = (message: string) => {
    setTestLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestLogs([]);
    setTestResults({ wave: null, task: null, labor: null });

    // ===========================
    // TEST 1: WAVE MANAGEMENT
    // ===========================
    setCurrentTest('Wave Management');
    log('🌊 Démarrage Test 1: Wave Management');

    try {
      // Générer 50 commandes de test
      const testOrders: Order[] = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        customer_name: `Client ${i + 1}`,
        status: 'pending' as const,
        priority: (i < 5 ? 'urgent' : i < 15 ? 'normal' : 'low') as any,
        shipping_method: (i < 10 ? 'express' : 'standard') as any,
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

      log(`📦 ${testOrders.length} commandes générées`);

      const generatedWaves = waveEngine.generateWaves(testOrders);
      setWaves(generatedWaves);

      log(`✅ ${generatedWaves.length} vagues générées`);
      generatedWaves.forEach((wave, idx) => {
        log(`  ${idx + 1}. ${wave.name} - ${wave.metrics.total_orders} commandes, ${wave.metrics.total_lines} lignes`);
      });

      const test1Passed = generatedWaves.length > 0 &&
        generatedWaves.every(w => w.metrics.total_orders <= 20);

      setTestResults(prev => ({ ...prev, wave: test1Passed }));
      log(test1Passed ? '✅ TEST 1 RÉUSSI' : '❌ TEST 1 ÉCHOUÉ');

      await new Promise(resolve => setTimeout(resolve, 1000));

      // ===========================
      // TEST 2: TASK MANAGEMENT
      // ===========================
      setCurrentTest('Task Management');
      log('\n📋 Démarrage Test 2: Task Management');

      if (generatedWaves.length > 0) {
        const firstWave = generatedWaves[0];
        const generatedTasks = taskEngine.generateTasks(firstWave.orders, firstWave.id);
        setTasks(generatedTasks);

        log(`✅ ${generatedTasks.length} tâches générées`);
        log(`  - Pick: ${generatedTasks.filter(t => t.type === 'pick').length}`);

        // Créer des opérateurs de test
        const testOperators: Operator[] = [
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
        setOperators(testOperators);

        log(`👷 ${testOperators.length} opérateurs disponibles`);

        const assignments = taskEngine.assignTasks(generatedTasks, testOperators, true);
        log(`🔀 Assignation avec INTERLEAVING`);

        assignments.forEach((assignedTasks, opId) => {
          const op = testOperators.find(o => o.id === opId);
          log(`  ${op?.name}: ${assignedTasks.length} tâches assignées`);
        });

        const metrics = taskEngine.calculateMetrics(generatedTasks);
        setTaskMetrics(metrics);

        const test2Passed = assignments.size > 0;
        setTestResults(prev => ({ ...prev, task: test2Passed }));
        log(test2Passed ? '✅ TEST 2 RÉUSSI' : '❌ TEST 2 ÉCHOUÉ');

        await new Promise(resolve => setTimeout(resolve, 1000));

        // ===========================
        // TEST 3: LABOR MANAGEMENT
        // ===========================
        setCurrentTest('Labor Management');
        log('\n🏆 Démarrage Test 3: Labor Management');

        // Simuler des tâches complétées
        const completedTasks: Task[] = [];
        testOperators.forEach((op, idx) => {
          const numTasks = 30 + idx * 15;
          for (let i = 0; i < numTasks; i++) {
            completedTasks.push({
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
              actual_time_seconds: 25 + Math.random() * 10,
            });
          }
        });

        log(`✅ ${completedTasks.length} tâches complétées simulées`);

        const calculatedPerformances = testOperators.map(op => {
          const opTasks = completedTasks.filter(t => t.assigned_to === op.id);
          return laborEngine.calculatePerformance(op, opTasks);
        });
        setPerformances(calculatedPerformances);

        log('📊 Performances calculées:');
        calculatedPerformances.forEach((perf, idx) => {
          log(`  ${idx + 1}. ${perf.operator_name} - ${perf.daily_score} pts (${perf.badges_earned.length} badges)`);
        });

        const generatedLeaderboard = laborEngine.generateLeaderboard(calculatedPerformances);
        setLeaderboard(generatedLeaderboard);

        log('🏅 Leaderboard généré:');
        generatedLeaderboard.forEach(entry => {
          const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`;
          log(`  ${medal} ${entry.operator_name} - ${entry.score} pts`);
        });

        const stats = laborEngine.calculateTeamStats(calculatedPerformances);
        setTeamStats(stats);

        log(`👥 Stats équipe: ${stats.total_operators} opérateurs, ${stats.total_picks} picks, ${stats.total_badges} badges`);

        const test3Passed = calculatedPerformances.length > 0 && generatedLeaderboard.length > 0;
        setTestResults(prev => ({ ...prev, labor: test3Passed }));
        log(test3Passed ? '✅ TEST 3 RÉUSSI' : '❌ TEST 3 ÉCHOUÉ');
      }
    } catch (error: any) {
      log(`❌ ERREUR: ${error.message}`);
      console.error('Test error:', error);
    }

    setCurrentTest('');
    setIsRunning(false);
    log('\n🏁 Tests terminés');
  };

  const getResultIcon = (result: boolean | null) => {
    if (result === null) return <div className="w-6 h-6 bg-gray-300 rounded-full" />;
    if (result) return <CheckCircle className="w-6 h-6 text-green-500" />;
    return <XCircle className="w-6 h-6 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🧪 Tests des Fonctionnalités Enterprise
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Validation des TOP 3 features: Wave Management, Task Management, Labor Management
          </p>

          <button
            onClick={runTests}
            disabled={isRunning}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Tests en cours...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Lancer les tests
              </>
            )}
          </button>
        </div>

        {/* Résultats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Wave Management</h3>
              {getResultIcon(testResults.wave)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {waves.length > 0 && `${waves.length} vagues générées`}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Task Management</h3>
              {getResultIcon(testResults.task)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {tasks.length > 0 && `${tasks.length} tâches générées`}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Labor Management</h3>
              {getResultIcon(testResults.labor)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {performances.length > 0 && `${performances.length} performances calculées`}
            </p>
          </div>
        </div>

        {/* Logs */}
        {testLogs.length > 0 && (
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
            <h3 className="text-white font-semibold mb-3">📜 Logs des tests</h3>
            <div className="bg-black rounded p-3 font-mono text-xs text-green-400 max-h-96 overflow-y-auto space-y-1">
              {testLogs.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* Aperçu des composants */}
        {currentTest === '' && waves.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              📊 Aperçu des Composants
            </h2>

            {/* Wave Management */}
            <WaveManagementPanel
              waves={waves}
              onReleaseWave={(id) => {
                setWaves(prev => prev.map(w => w.id === id ? { ...w, status: 'released' as const, released_at: new Date() } : w));
              }}
              onStartWave={(id) => {
                setWaves(prev => prev.map(w => w.id === id ? { ...w, status: 'in_progress' as const } : w));
              }}
              onCompleteWave={(id) => {
                setWaves(prev => prev.map(w => w.id === id ? { ...w, status: 'completed' as const, completed_at: new Date() } : w));
              }}
              onCancelWave={(id) => {
                setWaves(prev => prev.map(w => w.id === id ? { ...w, status: 'cancelled' as const } : w));
              }}
            />

            {/* Task Management */}
            {tasks.length > 0 && (
              <TaskManagementPanel
                tasks={tasks}
                operators={operators}
                metrics={taskMetrics}
                onStartTask={(id) => {
                  setTasks(prev => prev.map(t => t.id === id ? taskEngine.startTask(t) : t));
                }}
                onCompleteTask={(id) => {
                  setTasks(prev => prev.map(t => t.id === id ? taskEngine.completeTask(t) : t));
                }}
                onCancelTask={(id) => {
                  setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'cancelled' as const } : t));
                }}
                operatorView={false}
              />
            )}

            {/* Labor Management */}
            {performances.length > 0 && (
              <LaborManagementPanel
                leaderboard={leaderboard}
                performances={performances}
                currentOperatorId={operators[0]?.id}
                teamStats={teamStats}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
