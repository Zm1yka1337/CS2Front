import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Theory.css';

function Theory() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('peaks');

  const sections = [
    { id: 'peaks', name: 'Піки' },
    { id: 'movement', name: 'Рух' },
    { id: 'sounds', name: 'Звуки' },
    { id: 'utility', name: 'Утіліті' },
    { id: 'positions', name: 'Позиції' },
    { id: 'economy', name: 'Економіка' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'peaks':
        return (
          <div className="theory-content">
            <h2>Піки в CS2</h2>
            <div className="theory-section">
              <h3>Основи піків</h3>
              <p>Володіння різними техніками піків — ключ до переваги у перестрілках.</p>

              <div className="info-box">
                <strong>Головний принцип:</strong> Завжди пікай з метою і будь готовий стріляти.
              </div>

              <h4>Базові техніки піків</h4>
              <div className="technique-cards">
                <div className="technique-card">
                  <h5>Wide Peek</h5>
                  <p>Swinging wide around a corner to clear multiple angles quickly.</p>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{ width: '70%' }}></div>
                  </div>
                  <span>Risk Level: High</span>
                  <ul>
                    <li>Best for: Multiple enemies</li>
                    <li>When: Team support available</li>
                    <li>Avoid: ECO rounds</li>
                  </ul>
                </div>

                <div className="technique-card">
                  <h5>Shoulder Peek</h5>
                  <p>Quick peek to bait out shots and gather information.</p>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{ width: '90%' }}></div>
                  </div>
                  <span>Risk Level: Low</span>
                  <ul>
                    <li>Best for: Info gathering</li>
                    <li>When: Unsure of enemy position</li>
                    <li>Combine with: Counter-strafing</li>
                  </ul>
                </div>

                <div className="technique-card">
                  <h5>Jiggle Peek</h5>
                  <p>Rapid back and forth movement to spot enemies.</p>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{ width: '85%' }}></div>
                  </div>
                  <span>Risk Level: Medium</span>
                  <ul>
                    <li>Best for: AWP baiting</li>
                    <li>When: Checking common angles</li>
                    <li>Key: Rhythm timing</li>
                  </ul>
                </div>
              </div>

              <h4>Advanced Peeking Concepts</h4>
              <div className="theory-table-container">
                <div className="theory-table-body-container">
                  <table className="theory-table">
                    <thead>
                      <tr>
                        <th>TECHNIQUE</th>
                        <th>DESCRIPTION</th>
                        <th>BEST USED FOR</th>
                        <th>COUNTER PLAY</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Pre-aim Peek</td>
                        <td>Peeking with crosshair already placed at head level</td>
                        <td>Known positions</td>
                        <td>Off-angle holding</td>
                      </tr>
                      <tr>
                        <td>Flash Peek</td>
                        <td>Peeking immediately after flashbang</td>
                        <td>Site entry</td>
                        <td>Look away/retreat</td>
                      </tr>
                      <tr>
                        <td>Crouch Peek</td>
                        <td>Peeking while crouched</td>
                        <td>Surprising enemies</td>
                        <td>Pre-aim low</td>
                      </tr>
                      <tr>
                        <td>Double Peek</td>
                        <td>Two players peeking same angle with slight delay</td>
                        <td>Trading kills</td>
                        <td>Quick repositioning</td>
                      </tr>
                      <tr>
                        <td>Strafe Peek</td>
                        <td>Peeking while strafing for momentum</td>
                        <td>Dynamic entry</td>
                        <td>Spray control</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <h4>Peeking Timings</h4>
              <div className="flow-diagram">
                <div className="flow-step">
                  <h5>Pre-Peek Phase</h5>
                  <p>1. Check radar for team positions</p>
                  <p>2. Communicate intention</p>
                  <p>3. Prepare utility if needed</p>
                </div>
                <div className="flow-step">
                  <h5>Execution Phase</h5>
                  <p>1. Counter-strafe at corner</p>
                  <p>2. Clear angles one by one</p>
                  <p>3. Ready to shoot or fall back</p>
                </div>
                <div className="flow-step">
                  <h5>Post-Peek Phase</h5>
                  <p>1. Call out information</p>
                  <p>2. Support teammates</p>
                  <p>3. Prepare for counter-peek</p>
                </div>
              </div>

              <div className="warning-box">
                <strong>Remember:</strong> Never peek the same angle twice in the same way against good players!
              </div>

              <h4>Pro Player Signature Peeks</h4>
              <div className="technique-cards">
                <div className="pro-peek-card">
                  <h5>XANTARES Peek</h5>
                  <div className="player-info">
                    <span>İsmailcan Dörtkardeş</span>
                    <span>Known for: Aggressive pre-firing</span>
                  </div>
                  <p>An extremely aggressive peek style with perfect pre-aim and pre-fire timing.</p>
                  <div className="peek-details">
                    <h6>Key Elements:</h6>
                    <ul>
                      <li>Perfect pre-aim at head level</li>
                      <li>Aggressive wide peek</li>
                      <li>Pre-fire common angles</li>
                      <li>Maximum acceleration peeking</li>
                    </ul>
                    <div className="map-spots">
                      <span className="map-spot">Mirage Palace</span>
                      <span className="map-spot">Inferno Apps</span>
                      <span className="map-spot">Ancient Donut</span>
                    </div>
                  </div>
                </div>

                <div className="pro-peek-card">
                  <h5>Ferrari Peek</h5>
                  <div className="player-info">
                    <span>Named after fast cars</span>
                    <span>Type: Speed peek technique</span>
                  </div>
                  <p>Ultra-fast wide swing with maximum acceleration, often used with SMGs or rifles.</p>
                  <div className="peek-details">
                    <h6>Key Elements:</h6>
                    <ul>
                      <li>Maximum speed peek</li>
                      <li>Wide swing angle</li>
                      <li>Surprise factor</li>
                      <li>Good for multi-kills</li>
                    </ul>
                    <div className="map-spots">
                      <span className="map-spot">Dust2 Short</span>
                      <span className="map-spot">Mirage B Apps</span>
                      <span className="map-spot">Inferno Mid</span>
                    </div>
                  </div>
                </div>

                <div className="pro-peek-card">
                  <h5>ScreaM Peek</h5>
                  <div className="player-info">
                    <span>Adil Benrlitom</span>
                    <span>Known for: One-taps</span>
                  </div>
                  <p>Perfect counter-strafe peek with precise head-level one-tap accuracy.</p>
                  <div className="peek-details">
                    <h6>Key Elements:</h6>
                    <ul>
                      <li>Perfect counter-strafe</li>
                      <li>Head-level crosshair</li>
                      <li>Minimal exposure</li>
                      <li>Single-bullet accuracy</li>
                    </ul>
                    <div className="map-spots">
                      <span className="map-spot">Dust2 Long</span>
                      <span className="map-spot">Cache Mid</span>
                      <span className="map-spot">Mirage Connect</span>
                    </div>
                  </div>
                </div>
              </div>

              <h4>Common Mistakes</h4>
              <div className="technique-cards">
                <div className="technique-card">
                  <h5>Over-peeking</h5>
                  <p>Exposing yourself to too many angles at once.</p>
                  <ul>
                    <li>Clear one angle at a time</li>
                    <li>Use minimal exposure</li>
                    <li>Have escape route ready</li>
                  </ul>
                </div>
                <div className="technique-card">
                  <h5>Static Peeking</h5>
                  <p>Peeking without proper movement technique.</p>
                  <ul>
                    <li>Always use counter-strafing</li>
                    <li>Stay mobile between peeks</li>
                    <li>Vary peek timing</li>
                  </ul>
                </div>
                <div className="technique-card">
                  <h5>Predictable Patterns</h5>
                  <p>Using the same peeking pattern repeatedly.</p>
                  <ul>
                    <li>Mix up techniques</li>
                    <li>Change timing</li>
                    <li>Use utility to disrupt</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'movement':
        return (
          <div className="theory-content">
            <h2>Movement in CS2</h2>
            <div className="theory-section">
              <h3>Movement Mechanics</h3>
              <p>Mastering movement in CS2 is crucial for survival and effective combat.</p>

              <div className="info-box">
                <strong>Key Principle:</strong> Good movement makes you harder to hit while maintaining accuracy.
              </div>

              <h4>Basic Movement Techniques</h4>
              <div className="theory-table-container">
                <div className="theory-table-body-container">
                  <table className="theory-table">
                    <thead>
                      <tr>
                        <th>TECHNIQUE</th>
                        <th>DESCRIPTION</th>
                        <th>KEY BINDS</th>
                        <th>DIFFICULTY</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Counter-strafing</td>
                        <td>Stopping instantly by pressing opposite movement key</td>
                        <td>A/D or W/S</td>
                        <td>Medium</td>
                      </tr>
                      <tr>
                        <td>Bunny hop</td>
                        <td>Maintaining momentum through consecutive jumps</td>
                        <td>Space + Strafe</td>
                        <td>High</td>
                      </tr>
                      <tr>
                        <td>Air-strafing</td>
                        <td>Controlling movement in air</td>
                        <td>Mouse + A/D</td>
                        <td>High</td>
                      </tr>
                      <tr>
                        <td>Crouch-jump</td>
                        <td>Jumping while crouched for extra height</td>
                        <td>Space + Ctrl</td>
                        <td>Low</td>
                      </tr>
                      <tr>
                        <td>Silent-walk</td>
                        <td>Walking without making sound</td>
                        <td>Shift</td>
                        <td>Low</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="warning-box">
                <strong>Remember:</strong> Moving while shooting drastically reduces accuracy. Always counter-strafe before shooting!
              </div>

              <h4>Advanced Movement Concepts</h4>
              <div className="technique-cards">
                <div className="technique-card">
                  <h4>Silent Landing</h4>
                  <p>Landing without making sound by using crouch.</p>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{ width: '75%' }}></div>
                  </div>
                  <span>Mastery Level: Advanced</span>
                  <ul>
                    <li>Hold crouch before landing</li>
                    <li>Works up to medium heights</li>
                    <li>Perfect for sneaking</li>
                  </ul>
                </div>

                <div className="technique-card">
                  <h4>Run Boosting</h4>
                  <p>Boosting teammate by running into them while they jump.</p>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{ width: '60%' }}></div>
                  </div>
                  <span>Mastery Level: Expert</span>
                  <ul>
                    <li>Requires coordination</li>
                    <li>Both players must move</li>
                    <li>Timing is crucial</li>
                  </ul>
                </div>

                <div className="technique-card">
                  <h4>Surf Movement</h4>
                  <p>Using angled surfaces to maintain speed.</p>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{ width: '85%' }}></div>
                  </div>
                  <span>Mastery Level: Expert</span>
                  <ul>
                    <li>Hold strafe key</li>
                    <li>Move mouse smoothly</li>
                    <li>Practice on surf maps</li>
                  </ul>
                </div>
              </div>

              <h4>Movement Speed Comparison</h4>
              <div className="theory-table-container">
                <div className="theory-table-body-container">
                  <table className="theory-table">
                    <thead>
                      <tr>
                        <th>STATE</th>
                        <th>SPEED (UNITS/S)</th>
                        <th>SOUND LEVEL</th>
                        <th>USAGE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Running</td>
                        <td>250</td>
                        <td>Loud</td>
                        <td>Fast rotations, rushing</td>
                      </tr>
                      <tr>
                        <td>Walking</td>
                        <td>130</td>
                        <td>Quiet</td>
                        <td>Close combat positioning</td>
                      </tr>
                      <tr>
                        <td>Crouching</td>
                        <td>85</td>
                        <td>Silent</td>
                        <td>Sneaking, accuracy</td>
                      </tr>
                      <tr>
                        <td>Walking (Shift)</td>
                        <td>100</td>
                        <td>Silent</td>
                        <td>Stealth movement</td>
                      </tr>
                      <tr>
                        <td>Scoped AWP</td>
                        <td>100</td>
                        <td>Silent</td>
                        <td>Holding angles</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <h4>Movement Training</h4>
              <div className="flow-diagram">
                <div className="flow-step">
                  <h5>Basic Training</h5>
                  <p>1. Master counter-strafing</p>
                  <p>2. Practice smooth transitions</p>
                  <p>3. Learn basic jumps</p>
                </div>
                <div className="flow-step">
                  <h5>Intermediate Skills</h5>
                  <p>1. Bunny hop consistency</p>
                  <p>2. Air strafing control</p>
                  <p>3. Silent movement</p>
                </div>
                <div className="flow-step">
                  <h5>Advanced Techniques</h5>
                  <p>1. Run boosts</p>
                  <p>2. Surf control</p>
                  <p>3. Jump throws</p>
                </div>
              </div>

              <h4>Common Movement Mistakes</h4>
              <div className="technique-cards">
                <div className="technique-card">
                  <h5>Poor Counter-strafing</h5>
                  <p>Not stopping completely before shooting.</p>
                  <ul>
                    <li>Practice timing</li>
                    <li>Use dynamic crosshair</li>
                    <li>Start slow, build speed</li>
                  </ul>
                </div>
                <div className="technique-card">
                  <h5>Predictable Movement</h5>
                  <p>Moving in straight lines or patterns.</p>
                  <ul>
                    <li>Mix up direction</li>
                    <li>Use irregular timing</li>
                    <li>Combine techniques</li>
                  </ul>
                </div>
                <div className="technique-card">
                  <h5>Noisy Movement</h5>
                  <p>Making unnecessary sound.</p>
                  <ul>
                    <li>Use walk key</li>
                    <li>Time your steps</li>
                    <li>Know sound ranges</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'sounds':
        return (
          <div className="theory-content">
            <h2>Sound System in CS2</h2>
            <div className="theory-section">
              <h3>Understanding Sound Mechanics</h3>
              <p>Sound is a crucial information source in CS2, often determining the outcome of rounds.</p>

              <div className="info-box">
                <strong>Key Principle:</strong> Every action creates a unique sound that can be used to gain information.
              </div>

              <h4>Sound Categories</h4>
              <div className="technique-cards">
                <div className="technique-card">
                  <h5>Movement Sounds</h5>
                  <div className="skill-bar" data-progress="90%">
                    <div className="skill-progress" style={{ width: '90%' }}></div>
                  </div>
                  <span>Critical Importance</span>
                  <ul>
                    <li>Running: Loudest, heard from far</li>
                    <li>Walking: Medium range</li>
                    <li>Shift-walking: Silent</li>
                    <li>Crouch-walking: Silent</li>
                    <li>Landing sounds: Based on fall height</li>
                  </ul>
                </div>

                <div className="technique-card">
                  <h5>Weapon Sounds</h5>
                  <div className="skill-bar" data-progress="85%">
                    <div className="skill-progress" style={{ width: '85%' }}></div>
                  </div>
                  <span>High Importance</span>
                  <ul>
                    <li>Shooting: Unique per weapon</li>
                    <li>Reloading: Multiple phases</li>
                    <li>Scope: AWP/Scout specific</li>
                    <li>Weapon switch: Tactical info</li>
                  </ul>
                </div>

                <div className="technique-card">
                  <h5>Utility Sounds</h5>
                  <div className="skill-bar" data-progress="80%">
                    <div className="skill-progress" style={{ width: '80%' }}></div>
                  </div>
                  <span>Tactical Information</span>
                  <ul>
                    <li>Grenade pins: Early warning</li>
                    <li>Bounces: Location info</li>
                    <li>Explosions: Area denial</li>
                    <li>Molotov: Area control</li>
                  </ul>
                </div>
              </div>

              <h4>Sound Masking Techniques</h4>
              <div className="flow-diagram">
                <div className="flow-step">
                  <h5>Basic Sound Masking</h5>
                  <ul>
                    <li>Use utility explosions</li>
                    <li>Time steps with gunfire</li>
                    <li>Coordinate with team</li>
                  </ul>
                </div>
                <div className="flow-step">
                  <h5>Advanced Techniques</h5>
                  <ul>
                    <li>Fake utility sounds</li>
                    <li>Multi-level sound play</li>
                    <li>Sound baiting</li>
                  </ul>
                </div>
                <div className="flow-step">
                  <h5>Team Coordination</h5>
                  <ul>
                    <li>Synchronized pushes</li>
                    <li>Split sound distractions</li>
                    <li>Rotational fakes</li>
                  </ul>
                </div>
              </div>

              <h4>Sound Settings</h4>
              <table className="theory-table">
                <thead>
                  <tr>
                    <th>Setting</th>
                    <th>Recommended Value</th>
                    <th>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Audio Output</td>
                    <td>Headphones</td>
                    <td>Better directional audio</td>
                  </tr>
                  <tr>
                    <td>Volume</td>
                    <td>0.5-0.7</td>
                    <td>Protect hearing while maintaining info</td>
                  </tr>
                  <tr>
                    <td>Music Volume</td>
                    <td>0.1-0.2</td>
                    <td>Round cues only</td>
                  </tr>
                  <tr>
                    <td>Voice Scale</td>
                    <td>0.8</td>
                    <td>Clear team comms</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'utility':
        return (
          <div className="theory-content">
            <h2>Advanced Utility Usage</h2>
            <div className="theory-section">
              <h3>Utility Fundamentals</h3>
              <p>Mastering utility usage is crucial for both attack and defense.</p>

              <div className="info-box">
                <strong>Key Principle:</strong> Every piece of utility should have a specific purpose and timing.
              </div>

              <h4>Utility Types</h4>
              <div className="technique-cards">
                <div className="technique-card">
                  <h5>Smoke Grenades</h5>
                  <div className="skill-bar" data-progress="95%">
                    <div className="skill-progress" style={{ width: '95%' }}></div>
                  </div>
                  <span>Essential Utility</span>
                  <ul>
                    <li>Site executes</li>
                    <li>One-way setups</li>
                    <li>Retake support</li>
                    <li>Map control</li>
                  </ul>
                  <div className="peek-details">
                    <h6>Advanced Techniques:</h6>
                    <ul>
                      <li>Gap smokes for info</li>
                      <li>Fake executes</li>
                      <li>Smoke stacking</li>
                    </ul>
                  </div>
                </div>

                <div className="technique-card">
                  <h5>Flashbangs</h5>
                  <div className="skill-bar" data-progress="90%">
                    <div className="skill-progress" style={{ width: '90%' }}></div>
                  </div>
                  <span>Entry Utility</span>
                  <ul>
                    <li>Pop flashes</li>
                    <li>Support flashes</li>
                    <li>Retake flashes</li>
                    <li>Counter flashes</li>
                  </ul>
                  <div className="peek-details">
                    <h6>Advanced Techniques:</h6>
                    <ul>
                      <li>Run throw timing</li>
                      <li>Team flash setups</li>
                      <li>Flash baiting</li>
                    </ul>
                  </div>
                </div>

                <div className="technique-card">
                  <h5>Molotovs/Incendiaries</h5>
                  <div className="skill-bar" data-progress="85%">
                    <div className="skill-progress" style={{ width: '85%' }}></div>
                  </div>
                  <span>Area Denial</span>
                  <ul>
                    <li>Clear corners</li>
                    <li>Post-plant denial</li>
                    <li>Rush stopping</li>
                    <li>Force movement</li>
                  </ul>
                  <div className="peek-details">
                    <h6>Advanced Techniques:</h6>
                    <ul>
                      <li>Molotov lineups</li>
                      <li>Combo utility</li>
                      <li>Timing plays</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h4>Economy Management</h4>
              <table className="theory-table">
                <thead>
                  <tr>
                    <th>Round Type</th>
                    <th>Utility Priority</th>
                    <th>Investment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Full Buy</td>
                    <td>Full utility</td>
                    <td>$1000-1400</td>
                  </tr>
                  <tr>
                    <td>Force Buy</td>
                    <td>Flash + Smoke</td>
                    <td>$500-700</td>
                  </tr>
                  <tr>
                    <td>Eco</td>
                    <td>Flash only</td>
                    <td>$200-300</td>
                  </tr>
                </tbody>
              </table>

              <h4>Site Execute Combinations</h4>
              <div className="flow-diagram">
                <div className="flow-step">
                  <h5>Entry Setup</h5>
                  <ul>
                    <li>Flash for info</li>
                    <li>Clear close angles</li>
                    <li>Establish control</li>
                  </ul>
                </div>
                <div className="flow-step">
                  <h5>Site Take</h5>
                  <ul>
                    <li>Smoke key angles</li>
                    <li>Molotov common spots</li>
                    <li>Flash through smokes</li>
                  </ul>
                </div>
                <div className="flow-step">
                  <h5>Post-Plant</h5>
                  <ul>
                    <li>Save utility</li>
                    <li>Delay defuse</li>
                    <li>Cover exits</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'positions':
        return (
          <div className="theory-content">
            <h2>Advanced Positioning</h2>
            <div className="theory-section">
              <h3>Position Fundamentals</h3>
              <p>Proper positioning is key to winning rounds and staying alive.</p>

              <div className="info-box">
                <strong>Key Principle:</strong> Always position yourself with a purpose and an escape plan.
              </div>

              <h4>Position Types</h4>
              <div className="technique-cards">
                <div className="technique-card">
                  <h5>Anchor Positions</h5>
                  <div className="skill-bar" data-progress="90%">
                    <div className="skill-progress" style={{ width: '90%' }}></div>
                  </div>
                  <span>Site Hold</span>
                  <ul>
                    <li>Safe angles</li>
                    <li>Multiple fall back spots</li>
                    <li>Utility usage positions</li>
                    <li>Crossfire setups</li>
                  </ul>
                </div>

                <div className="technique-card">
                  <h5>Aggressive Positions</h5>
                  <div className="skill-bar" data-progress="85%">
                    <div className="skill-progress" style={{ width: '85%' }}></div>
                  </div>
                  <span>Map Control</span>
                  <ul>
                    <li>Early info gathering</li>
                    <li>Pick potential</li>
                    <li>Fall back routes</li>
                    <li>Support positions</li>
                  </ul>
                </div>

                <div className="technique-card">
                  <h5>Retake Positions</h5>
                  <div className="skill-bar" data-progress="80%">
                    <div className="skill-progress" style={{ width: '80%' }}></div>
                  </div>
                  <span>Site Retake</span>
                  <ul>
                    <li>Utility lineups</li>
                    <li>Crossfire angles</li>
                    <li>Safe plant spots</li>
                    <li>Trade positions</li>
                  </ul>
                </div>
              </div>

              <h4>Map Control Phases</h4>
              <div className="flow-diagram">
                <div className="flow-step">
                  <h5>Early Round</h5>
                  <ul>
                    <li>Default positions</li>
                    <li>Info gathering</li>
                    <li>Utility setup</li>
                  </ul>
                </div>
                <div className="flow-step">
                  <h5>Mid Round</h5>
                  <ul>
                    <li>Rotation positions</li>
                    <li>Map control</li>
                    <li>Trade setups</li>
                  </ul>
                </div>
                <div className="flow-step">
                  <h5>Late Round</h5>
                  <ul>
                    <li>Plant positions</li>
                    <li>After plant spots</li>
                    <li>Retake angles</li>
                  </ul>
                </div>
              </div>

              <h4>Position Adaptation</h4>
              <table className="theory-table">
                <thead>
                  <tr>
                    <th>Scenario</th>
                    <th>Position Type</th>
                    <th>Adjustment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Enemy Force Buy</td>
                    <td>Anti-rush</td>
                    <td>Close angles, utility ready</td>
                  </tr>
                  <tr>
                    <td>Man Advantage</td>
                    <td>Passive</td>
                    <td>Safe positions, trade setup</td>
                  </tr>
                  <tr>
                    <td>Man Disadvantage</td>
                    <td>Aggressive</td>
                    <td>Info gathering, pick potential</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'economy':
        return (
          <div className="theory-content">
            <h2>Economy Management</h2>
            <div className="theory-section">
              <h3>Economy Fundamentals</h3>
              <p>Understanding and managing team economy is crucial for maintaining momentum.</p>

              <div className="info-box">
                <strong>Key Principle:</strong> Always make buy decisions as a team and consider future rounds.
              </div>

              <h4>Round Income</h4>
              <table className="theory-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Reward</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Round Win (T)</td>
                    <td>$3500</td>
                    <td>Base reward</td>
                  </tr>
                  <tr>
                    <td>Round Win (CT)</td>
                    <td>$3250</td>
                    <td>Base reward</td>
                  </tr>
                  <tr>
                    <td>Kill Reward</td>
                    <td>$300-3000</td>
                    <td>Weapon dependent</td>
                  </tr>
                  <tr>
                    <td>Bomb Plant</td>
                    <td>$300</td>
                    <td>Per player</td>
                  </tr>
                </tbody>
              </table>

              <h4>Buy Strategies</h4>
              <div className="technique-cards">
                <div className="technique-card">
                  <h5>Full Buy</h5>
                  <div className="skill-bar" data-progress="100%">
                    <div className="skill-progress" style={{ width: '100%' }}></div>
                  </div>
                  <span>$5000+ Investment</span>
                  <ul>
                    <li>Primary weapon</li>
                    <li>Full armor</li>
                    <li>Full utility</li>
                    <li>Kit (CT)</li>
                  </ul>
                </div>

                <div className="technique-card">
                  <h5>Force Buy</h5>
                  <div className="skill-bar" data-progress="60%">
                    <div className="skill-progress" style={{ width: '60%' }}></div>
                  </div>
                  <span>$2500-3500 Investment</span>
                  <ul>
                    <li>SMG/cheap rifle</li>
                    <li>Light/no armor</li>
                    <li>Basic utility</li>
                    <li>High risk/reward</li>
                  </ul>
                </div>

                <div className="technique-card">
                  <h5>Eco Round</h5>
                  <div className="skill-bar" data-progress="30%">
                    <div className="skill-progress" style={{ width: '30%' }}></div>
                  </div>
                  <span>$0-1500 Investment</span>
                  <ul>
                    <li>Pistols only</li>
                    <li>Minimal utility</li>
                    <li>Save money</li>
                    <li>Info gathering</li>
                  </ul>
                </div>
              </div>

              <h4>Loss Bonus System</h4>
              <div className="flow-diagram">
                <div className="flow-step">
                  <h5>Initial Loss</h5>
                  <p>$1400</p>
                  <ul>
                    <li>Basic pistol buy</li>
                    <li>Save for next</li>
                  </ul>
                </div>
                <div className="flow-step">
                  <h5>2-3 Losses</h5>
                  <p>$1900-2400</p>
                  <ul>
                    <li>Force buy potential</li>
                    <li>Light utility</li>
                  </ul>
                </div>
                <div className="flow-step">
                  <h5>4+ Losses</h5>
                  <p>$2900-3400</p>
                  <ul>
                    <li>Full buy possible</li>
                    <li>Reset risk</li>
                  </ul>
                </div>
              </div>

              <div className="warning-box">
                <strong>Important:</strong> Always communicate your buy decisions with your team and track enemy economy!
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="theory-page">
      <div className="theory-navigation">
        {sections.map(section => (
          <button
            key={section.id}
            className={`theory-nav-button ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.name}
          </button>
        ))}
      </div>
      {renderContent()}
    </div>
  );
}

export default Theory;