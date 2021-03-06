import React, { memo, useState, useEffect, useRef, useMemo } from 'react';
import { Button, TextInputField, SideSheet, TagInput, Checkbox, Badge, Label, Textarea, Text } from 'evergreen-ui';
import Swal from 'sweetalert2';
import moment from 'moment';

import Lottie from 'react-lottie';

import runningLottie from './14470-phone-running.json'
import robotLottie from './10178-c-bot.json'
import robotDizzyLottie from './13680-robot-call.json';
import loveLottie from './13682-heart.json';

const electron = window.require('electron');

const { powerSaveBlocker } = electron.remote.require('electron');
const { initInstauto, runFollowUserFollowers, cleanupInstauto, checkHaveCookies, deleteCookies } = electron.remote.require('./electron');
const configStore = electron.remote.require('./store');

const AdvancedSettings = memo(({ advancedSettings, onChange }) => {
  const [advancedSettingsTxt, setAdvancedSettingsTxt] = useState();
  const [valid, setValid] = useState(true);

  function onTextareaChange(e) {
    try {
      const { value } = e.target;
      setAdvancedSettingsTxt(value);
      const parsed = JSON.parse(value);
      setValid(true);
      onChange(parsed);
      setAdvancedSettingsTxt();
    } catch (err) {
      setValid(false);
      console.error(err);
    }
  }

  const optsData = {
    dontUnfollowUntilDaysElapsed: {
      description: "Don't unfollow already followed users until the number of days have passed",
    },
    followUserMinFollowing: {
      description: "Don't follow users who follow less people than this",
    },
    followUserMinFollowers: {
      description: "Don't follow users who have less followers than this",
    },
    followUserMaxFollowers: {
      description: "Don't follow users who have more followers than this",
    },
    followUserMaxFollowing: {
      description: "Don't follow users who are following more than this",
    },
    followUserRatioMin: {
      description: "Don't follow users that have a followers / following ratio lower than this",
    },
    followUserRatioMax: {
      description: "Don't follow users that have a followers / following ratio higher than this",
    },
    maxFollowsPerHour: {
      description: 'Global limit that prevents follow or unfollows (total) to exceed this number over a sliding window of one hour.  NOTE setting this too high will cause temp ban/throttle',
    },
    maxFollowsPerDay: {
      description: 'Global limit that prevents follow or unfollows (total) to exceed this number over a sliding window of 24h. NOTE setting this too high will cause temp ban/throttle',
    },
    maxFollowsPerUser: {
      description: "How many of each celeb user's followers to follow",
    },
    runAtHour: {
      description: 'Repeat at this hour (24hr based) every day',
    },
  };

  return (
    <>
      <Lottie
        options={{ loop: true, autoplay: true, animationData: robotDizzyLottie }}
        style={{ width: 100, height: 100, margin: 0 }}
      />

      {Object.entries(advancedSettings).map(([key, value]) => (
        <div key={key} style={{ margin: '10px 0' }}>
          <b>{key}</b> <Badge color={value != null ? 'green' : undefined}>{value != null ? String(value) : 'unset'}</Badge>
          <div>{optsData[key].description}</div>
        </div>
      ))}

      <Label
        htmlFor="textarea"
        marginBottom={4}
        display="block"
      >
        Change settings here (JSON):
      </Label>
      <Textarea
        isInvalid={!valid}
        rows={10}
        id="textarea"
        onChange={onTextareaChange}
        value={advancedSettingsTxt != null ? advancedSettingsTxt : JSON.stringify(advancedSettings, null, 2)}
      />
    </>
  )
});

const LogView = memo(({ logs, style, fontSize } = {}) => {
  const logViewRef = useRef();
  useEffect(() => {
    if (logViewRef.current) logViewRef.current.scrollTop = logViewRef.current.scrollHeight;
  }, [logs]);

  return (
    <div ref={logViewRef} style={{ width: '100%', height: 100, overflowY: 'scroll', overflowX: 'hidden', textAlign: 'left', ...style }}>
      {logs.map(({ args, level, time }, i) => {
        const color = {
          warn: 'warning',
          error: 'danger',
        }[level] || undefined;

        return (
          <div>
            <Text style={{ marginRight: 5, whiteSpace: 'pre-wrap', fontSize }}>{moment(time).format('LT')}</Text>
            <Text color={color} key={i} style={{ whiteSpace: 'pre-wrap', fontSize }}>
              {args.map(arg => String(arg)).join(' ')}
            </Text>
          </div>
        );
      })}
    </div>
  );
});

const App = memo(() => {
  const [advancedSettings, setAdvancedSettings] = useState({
    maxFollowsPerDay: configStore.get('maxFollowsPerDay'),
    maxFollowsPerHour: configStore.get('maxFollowsPerHour'),
    followUserRatioMin: configStore.get('followUserRatioMin'),
    followUserRatioMax: configStore.get('followUserRatioMax'),
    followUserMaxFollowers: configStore.get('followUserMaxFollowers'),
    followUserMaxFollowing: configStore.get('followUserMaxFollowing'),
    followUserMinFollowers: configStore.get('followUserMinFollowers'),
    followUserMinFollowing: configStore.get('followUserMinFollowing'),
    dontUnfollowUntilDaysElapsed: configStore.get('dontUnfollowUntilDaysElapsed'),
    maxFollowsPerUser: configStore.get('maxFollowsPerUser'),
    runAtHour: configStore.get('runAtHour'),
  });

  useEffect(() => configStore.set('maxFollowsPerDay', advancedSettings.maxFollowsPerDay), [advancedSettings.maxFollowsPerDay]);
  useEffect(() => configStore.set('maxFollowsPerHour', advancedSettings.maxFollowsPerHour), [advancedSettings.maxFollowsPerHour]);
  useEffect(() => configStore.set('followUserRatioMin', advancedSettings.followUserRatioMin), [advancedSettings.followUserRatioMin]);
  useEffect(() => configStore.set('followUserRatioMax', advancedSettings.followUserRatioMax), [advancedSettings.followUserRatioMax]);
  useEffect(() => configStore.set('followUserMaxFollowers', advancedSettings.followUserMaxFollowers), [advancedSettings.followUserMaxFollowers]);
  useEffect(() => configStore.set('followUserMaxFollowing', advancedSettings.followUserMaxFollowing), [advancedSettings.followUserMaxFollowing]);
  useEffect(() => configStore.set('followUserMinFollowers', advancedSettings.followUserMinFollowers), [advancedSettings.followUserMinFollowers]);
  useEffect(() => configStore.set('followUserMinFollowing', advancedSettings.followUserMinFollowing), [advancedSettings.followUserMinFollowing]);
  useEffect(() => configStore.set('dontUnfollowUntilDaysElapsed', advancedSettings.dontUnfollowUntilDaysElapsed), [advancedSettings.dontUnfollowUntilDaysElapsed]);
  useEffect(() => configStore.set('maxFollowsPerUser', advancedSettings.maxFollowsPerUser), [advancedSettings.maxFollowsPerUser]);
  useEffect(() => configStore.set('runAtHour', advancedSettings.runAtHour), [advancedSettings.runAtHour]);

  const [haveCookies, setHaveCookies] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [running, setRunning] = useState(false);
  const [advancedVisible, setAdvancedVisible] = useState(false);
  const [logsVisible, setLogsVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [skipPrivate, setSkipPrivate] = useState(configStore.get('skipPrivate'));
  const [usersToFollowFollowersOf, setUsersToFollowFollowersOf] = useState(configStore.get('usersToFollowFollowersOf'));

  const [logs, setLogs] = useState([]);

  const usersToFollowFollowersOfCleaned = useMemo(() => usersToFollowFollowersOf.map(user => user.replace(/^@/g, '')), [usersToFollowFollowersOf]);

  useEffect(() => configStore.set('skipPrivate', skipPrivate), [skipPrivate]);
  useEffect(() => configStore.set('usersToFollowFollowersOf', usersToFollowFollowersOf), [usersToFollowFollowersOf]);

  const isUsersValid = usersToFollowFollowersOf.length >= 1;


  async function updateCookiesState() {
    setHaveCookies(await checkHaveCookies());
  }

  useEffect(() => {
    updateCookiesState();
  }, []);

  async function onLogoutClick() {
    await deleteCookies();
    await updateCookiesState();
  }

  async function onStartPress() {
    if (!isUsersValid) {
      Swal.fire('Please add at least 1 username to the list!');
      return;
    }
    if (running) {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This will terminate the bot and you will lose any logs',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Stop the bot',
        cancelButtonText: 'Leave it running',
      });
      if (result.value) electron.remote.app.quit();
      return;
    }

    setLogs([]);
    setRunning(true);

    const powerSaveBlockerId = powerSaveBlocker.start('prevent-app-suspension');

    function log(level, ...args) {
      console[level](...args);
      setLogs((l) => [...l, { time: new Date(), level, args }]);
    }

    const logger = {
      log: (...args) => log('log', ...args),
      error: (...args) => log('error', ...args),
      warn: (...args) => log('warn', ...args),
      info: (...args) => log('info', ...args),
      debug: (...args) => log('debug', ...args),
    };

    try {
      await initInstauto({
        ...advancedSettings,
      
        excludeUsers: [],
      
        dryRun,
      
        username,
        password,

        logger,
      });

      await runFollowUserFollowers({
        usernames: usersToFollowFollowersOfCleaned,
        ageInDays: advancedSettings.dontUnfollowUntilDaysElapsed,
        maxFollowsPerUser: advancedSettings.maxFollowsPerUser,
        skipPrivate,
        runAtHour: advancedSettings.runAtHour,
      });
    } catch (err) {
      logger.error(err);
      await Swal.fire({ icon: 'error', title: 'Failed to run', text: 'Check logs, then try to log out and log back in or restart the app.' });
      await onLogoutClick();
    } finally {
      setRunning(false);
      cleanupInstauto();
      powerSaveBlocker.stop(powerSaveBlockerId);
    }
  }

  return (
    <>
      <div style={{ margin: 20 }}>
        <div>
          {running ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Lottie
                options={{ loop: true, autoplay: true, animationData: runningLottie }}
                style={{ maxWidth: 200, width: '100%' }}
              />

              <div style={{ fontSize: 27 }}>Your bot is running</div>
              <div style={{ margin: '20px 0' }}>Leave this application running on your computer and keep it connected to power and prevent it from sleeping and the bot will work for you while you are doing more useful things</div>

              <LogView fontSize={10} logs={logs} />
            </div>
          ) : (
            <>
              <div style={{ display: 'flex' }}>
                <div style={{ width: '50%', margin: '10px 10px' }}>
                  <Lottie
                    options={{ loop: true, autoplay: true, animationData: robotLottie }}
                    style={{ width: 150, height: 150 }}
                  />

                  {haveCookies ? (
                    <Button iconBefore="log-out" type="button" intent="danger" onClick={onLogoutClick}>Log out</Button>
                  ) : (
                    <>
                      <TextInputField
                        isInvalid={username.length < 1}
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        label="Instagram username"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck={false}
                      />

                      <TextInputField
                        value={password}
                        isInvalid={password.length < 4}
                        onChange={e => setPassword(e.target.value)}
                        type="password"
                        label="Password"
                      />
                    </>
                  )}

                  <Button iconBefore="settings" type="button" onClick={() => setAdvancedVisible(true)}>Show advanced settings</Button>
                </div>

                <div style={{ width: '50%', margin: '10px 10px' }}>
                  <div style={{ margin: '20px 0' }}>
                    <Label style={{ display: 'block' }}>List of usernames that we should follow the followers of. Can be celebrities etc, users with a lot of followers. SimpleInstaBot will go into each of these accounts and find their recent followers and follow up to {advancedSettings.maxFollowsPerUser} of these, in hope that they will follow back. Then after a {advancedSettings.dontUnfollowUntilDaysElapsed} days it will unfollow them again. The more users, the more diversity. <b>Press ENTER between each username</b></Label>
                    <TagInput
                      inputProps={{ placeholder: "Influencers, celebrities, etc." }}
                      values={usersToFollowFollowersOf}
                      onChange={setUsersToFollowFollowersOf}
                      separator={/[,\s]/}
                    />
                  </div>

                  <div style={{ margin: '20px 0' }}>
                    <Label>Check this to skip following private accounts</Label>
                    <Checkbox
                      label="Skip private"
                      checked={skipPrivate}
                      onChange={e => setSkipPrivate(e.target.checked)}
                    />
                  </div>

                  <div style={{ margin: '20px 0' }}>
                    <Label>If checked, will not actually perform any actions (useful for testing)</Label>
                    <Checkbox
                      label="Dry run"
                      checked={dryRun}
                      onChange={e => setDryRun(e.target.checked)}
                    />
                  </div>
                </div>
              </div>

              <div>
                When your press the Start button the bot will start immediately, then repeat every day (24hr) at {advancedSettings.runAtHour}:00 until the program is stopped.<br />
                Note: Be sure to run this on a normal home internet connection, or you will increase the risk being banned. Do not use a VPN.<br />
                <b>If possible use same internet connection as you normally use your Instagram mobile app</b><br />
              </div>
              <div style={{ margin: '10px 0', fontSize: 12 }}>
                I am not responsible for any consequences for you or your instagram account by using this bot.
              </div>
            </>
          )}

          <div style={{ margin: '20px 0', textAlign: 'center' }}>
            <Button iconBefore={running ? 'stop' : 'play'} height={40} type="button" intent={running ? 'danger' : 'success'} onClick={onStartPress}>{running ? 'Stop bot' : 'Start bot'}</Button>
            {logs.length > 0 && <Button iconBefore="list" height={40} type="button" onClick={() => setLogsVisible(true)}>Logs</Button>}
          </div>


          <div>
            <h3>Troubleshooting</h3>
            If it's not working, make sure your instagram language is set to english. Also check that all usernames are correct.
          </div>

          <div style={{ position: 'fixed', right: 0, bottom: 5, background: 'rgba(255,255,255,0.6)' }}>
            <Button appearance="minimal" onClick={() => electron.shell.openExternal('https://mifi.no/')}>More apps by mifi.no</Button>
            <Lottie
              options={{ loop: true, autoplay: true, animationData: loveLottie }}
              style={{ width: 50, height: 50, display: 'inline-block', marginLeft: -10, marginTop: -40, marginBottom: -20 }}
            />
          </div>
        </div>

      </div>

      <SideSheet isShown={advancedVisible} onCloseComplete={() => setAdvancedVisible(false)}>
        <div style={{ margin: 20 }}>
          <h3>Advanced settings</h3>

          <AdvancedSettings advancedSettings={advancedSettings} onChange={setAdvancedSettings} />

          <Button iconBefore="tick" type="button" onClick={() => setAdvancedVisible(false)}>Save &amp; Close</Button>
        </div>
      </SideSheet>

      <SideSheet isShown={logsVisible} onCloseComplete={() => setLogsVisible(false)}>
        <div style={{ margin: 20 }}>
          <h3>Logs from last run</h3>

          <LogView logs={logs} fontSize={13} style={{ height: '100%' }} />
        </div>
      </SideSheet>
    </>
  );
});

export default App;
