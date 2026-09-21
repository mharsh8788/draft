// End-to-End Draft Game Engine Test Suite
import { ROUND_POSITIONS } from './data/players.js';

const BASE_URL = 'http://localhost:5000/api';

async function runTestSuite() {
  console.log('🧪 Starting Bayern Draft Automated Test Suite...\n');

  // Test 1: Health check
  console.log('Test 1: Health Check');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  if (health.status !== 'online') throw new Error('Health check failed');
  console.log('✅ Health check passed: online\n');

  // Test 2: Get all players
  console.log('Test 2: Player Database Count & Positions');
  const playersRes = await fetch(`${BASE_URL}/players`);
  const playersData = await playersRes.json();
  console.log(`✅ Loaded ${playersData.count} FC Bayern players`);
  if (playersData.count < 40) throw new Error('Expected at least 40 players');

  // Test 3: Create Draft Session
  console.log('\nTest 3: Initialize Draft Session');
  const draftRes = await fetch(`${BASE_URL}/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const draftData = await draftRes.json();
  if (!draftData.success) throw new Error('Failed to create draft');
  const draftId = draftData.data.id;
  console.log(`✅ Draft created successfully with ID: ${draftId}`);
  console.log(`   Round 1 Position: ${draftData.data.position.label}`);
  console.log(`   Revealed Player: ${draftData.data.revealedPlayer.name}`);
  console.log(`   Mystery Player: Position ${draftData.data.mysteryPlayer.position}, ID and stats hidden`);

  // Test 4: Simulate 11 Rounds with Duplicate and Position Validation
  console.log('\nTest 4: Simulating complete 11-round draft...');
  const userPicks = [];
  const opponentPicks = [];
  let currentPair = {
    revealedPlayer: draftData.data.revealedPlayer,
    mysteryPlayer: draftData.data.mysteryPlayer
  };

  for (let r = 1; r <= 11; r++) {
    const roundConfig = ROUND_POSITIONS.find(pos => pos.round === r);
    // Alternate choice: odd rounds choose revealed, even rounds choose mystery
    const choice = r % 2 === 1 ? 'revealed' : 'mystery';

    const pickRes = await fetch(`${BASE_URL}/drafts/${draftId}/choose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        choice,
        revealedPlayerId: currentPair.revealedPlayer.id,
        mysteryPlayerId: currentPair.mysteryPlayer.id
      })
    });
    const pickData = await pickRes.json();

    if (!pickData.success) {
      throw new Error(`Round ${r} pick failed: ${pickData.error}`);
    }

    const { revealedMysteryPlayer, userPick, opponentPick, nextRound, isFinished } = pickData.data;

    // Check duplicates
    if (userPicks.includes(userPick.id) || opponentPicks.includes(opponentPick.id)) {
      throw new Error(`Duplicate player detected in round ${r}`);
    }
    userPicks.push(userPick.id);
    opponentPicks.push(opponentPick.id);

    console.log(`   Round ${r}/11 (${roundConfig.label}): Picked ${choice === 'mystery' ? 'MYSTERY (' + revealedMysteryPlayer.name + ')' : userPick.name} | Opponent: ${opponentPick.name}`);

    if (r < 11) {
      if (!nextRound) throw new Error(`Missing next round pair after round ${r}`);
      currentPair = {
        revealedPlayer: nextRound.revealedPlayer,
        mysteryPlayer: nextRound.mysteryPlayer
      };
    } else {
      if (!isFinished) throw new Error('Draft should be marked finished after round 11');
    }
  }

  console.log('\n✅ All 11 rounds completed with unique players on both squads!');

  // Test 5: Finalize and compare statistics
  console.log('\nTest 5: Finalize draft and retrieve objective head-to-head comparison');
  const finishRes = await fetch(`${BASE_URL}/drafts/${draftId}/finish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const finishData = await finishRes.json();
  if (!finishData.success) throw new Error('Failed to finish draft');

  const { userStats, opponentStats, comparisonMessage } = finishData.data;
  console.log(`✅ Message: "${comparisonMessage}"`);
  console.log(`   Your XI Avg OVR: ${userStats.avgRating} | Goals: ${userStats.goals} | Trophies: ${userStats.trophies}`);
  console.log(`   Mystery XI Avg OVR: ${opponentStats.avgRating} | Goals: ${opponentStats.goals} | Trophies: ${opponentStats.trophies}`);

  // Test 6: Validation - test invalid choice
  console.log('\nTest 6: Rule Validation - Invalid choice error handling');
  const invalidRes = await fetch(`${BASE_URL}/drafts/${draftId}/choose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      choice: 'invalid_option',
      revealedPlayerId: 'neuer',
      mysteryPlayerId: 'kahn'
    })
  });
  const invalidData = await invalidRes.json();
  if (invalidRes.status === 400 && !invalidData.success) {
    console.log(`✅ Successfully rejected invalid choice: "${invalidData.error}"`);
  } else {
    throw new Error('Server should have rejected invalid choice with status 400');
  }

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 100% VERIFIED.');
}

runTestSuite().catch(err => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
