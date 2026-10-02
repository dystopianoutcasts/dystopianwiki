// Run with: deno test --allow-read --allow-env packages/shared/aurora/serverconfig.test.ts
//
// The two tests at the end read a real servertest.ini / servertest_SandboxVars.lua
// when one is on this machine (AURORA_SERVER_INI / AURORA_SANDBOX_LUA, default the
// local Zomboid\Server folder) and skip otherwise. Their failure messages never
// print a value from the file, because the .ini holds passwords.
import { INI_KEYS, parseSandboxVars, parseServerIni } from './serverconfig.ts';

function assertEquals<T>(actual: T, expected: T, msg = ''): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${msg} expected ${e} got ${a}`);
}

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

const INI = `# a comment
PVP=false
PauseEmpty=true
Open=false
ServerWelcomeMessage=Welcome to <RGB:1,0,0> Outcasts <LINE> be nice
DefaultPort=16261
Mods=\\OutcastLib;\\OutcastPunch;;
WorkshopItems=3778987608;3809892126
Map=Muldraugh, KY
Public=true
PublicName=Dystopian Outcasts
PublicDescription=A Build 42 server
MaxPlayers=32
RCONPassword=SECRET-RCON-1
Password=SECRET-JOIN-2
DiscordToken=SECRET-DISCORD-3
ServerPlayerID=SECRET-ID-4
ResetID=SECRET-RESET-5
WebhookAddress=https://SECRET-HOOK-6
NotAKeyWeKnow=whatever
garbage line without equals
`;

Deno.test('the ini keeps only the listed keys, typed', () => {
  const out = parseServerIni(INI);
  assertEquals(out.PVP, false);
  assertEquals(out.PauseEmpty, true);
  assertEquals(out.MaxPlayers, 32);
  assertEquals(out.DefaultPort, 16261);
  assertEquals(out.PublicName, 'Dystopian Outcasts');
  assertEquals(out.Mods, ['OutcastLib', 'OutcastPunch'], 'split on ;, backslash and blanks dropped');
  assertEquals(out.WorkshopItems, ['3778987608', '3809892126']);
  assertEquals(out.Map, ['Muldraugh, KY']);
  assert(!('NotAKeyWeKnow' in out), 'unknown keys are dropped');
  for (const key of Object.keys(out)) {
    assert((INI_KEYS as readonly string[]).includes(key) || key === 'HasPassword', `unexpected key ${key}`);
  }
});

Deno.test('no secret survives: passwords, tokens and ids never reach the output', () => {
  const out = parseServerIni(INI);
  const text = JSON.stringify(out);
  assert(!/SECRET/.test(text), 'a secret value leaked into the parsed settings');
  for (const k of ['Password', 'RCONPassword', 'DiscordToken', 'ServerPlayerID', 'ResetID', 'WebhookAddress']) {
    assert(!(k in out), `${k} must not be kept`);
  }
  assertEquals(out.HasPassword, true, 'only whether a join password is set');
  assertEquals(parseServerIni('Password=\nPVP=true').HasPassword, false, 'an empty password means none');
});

const SANDBOX = `SandboxVars = {
    VERSION = 6,
    -- Changing this also sets the "Population Multiplier". Default = Normal
    -- 1 = Insane
    -- 4 = Normal
    Zombies = 4,
    -- Min: 0.00 Max: 4.00 Default: 0.60
    SkillBookLoot = 0.6,
    ZombieVoronoiNoise = true,
    LootItemRemovalList = "",
    StrangeValue = SomeFunction(),
    ZombieLore = {
        -- How fast zombies move. Default = Random
        -- 1 = Sprinters
        -- 2 = Fast Shamblers
        -- 4 = Random
        Speed = 2,
        -- 1 = Superhuman
        -- 2 = Normal
        Strength = 2,
        Memory = 1,
        SprinterPercentage = 0,
    },
    MultiplierConfig = {
        Global = 1.5,
    },
}
After = 1,
`;

Deno.test('sandbox values are flattened with their comment labels', () => {
  const out = parseSandboxVars(SANDBOX);
  assertEquals(out.Zombies, { v: 4, label: 'Normal' });
  assertEquals(out['ZombieLore.Speed'], { v: 2, label: 'Fast Shamblers' });
  assertEquals(out['ZombieLore.Strength'], { v: 2, label: 'Normal' });
  assertEquals(out['ZombieLore.Memory'], { v: 1 }, 'a key without its own labels does not borrow the previous key labels');
  assertEquals(out['ZombieLore.SprinterPercentage'], { v: 0 });
  assertEquals(out['MultiplierConfig.Global'], { v: 1.5 });
  assertEquals(out.SkillBookLoot, { v: 0.6 });
  assertEquals(out.ZombieVoronoiNoise, { v: true });
  assertEquals(out.LootItemRemovalList, { v: '' });
  assert(!('StrangeValue' in out), 'a value that is not a plain scalar is skipped');
  assert(!('After' in out), 'reading stops at the end of SandboxVars');
});

Deno.test('a file that is not a SandboxVars table yields nothing', () => {
  assertEquals(parseSandboxVars('Something = { A = 1, }'), {});
  assertEquals(parseSandboxVars(''), {});
});

const HOME = Deno.env.get('USERPROFILE') ?? Deno.env.get('HOME') ?? '';
const INI_PATH = Deno.env.get('AURORA_SERVER_INI') ?? `${HOME}/Zomboid/Server/servertest.ini`;
const LUA_PATH = Deno.env.get('AURORA_SANDBOX_LUA') ?? `${HOME}/Zomboid/Server/servertest_SandboxVars.lua`;

async function maybeRead(path: string): Promise<string | null> {
  try {
    return await Deno.readTextFile(path);
  } catch {
    return null;
  }
}

const realIni = await maybeRead(INI_PATH);
const realLua = await maybeRead(LUA_PATH);

Deno.test({
  name: 'a real servertest.ini keeps only listed keys and no secret value',
  ignore: realIni === null,
  fn() {
    const out = parseServerIni(realIni!);
    const text = JSON.stringify(out);
    for (const key of Object.keys(out)) {
      assert((INI_KEYS as readonly string[]).includes(key) || key === 'HasPassword', 'an unlisted key was kept');
    }
    const secretKeys = ['Password', 'RCONPassword', 'DiscordToken', 'ServerPlayerID', 'ResetID', 'WebhookAddress'];
    for (const line of realIni!.split(/\r?\n/)) {
      const eq = line.indexOf('=');
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      const value = line.slice(eq + 1).trim();
      if (secretKeys.includes(key) && value.length >= 4) {
        assert(!text.includes(value), `the value of ${key} leaked`);
      }
    }
    assert(typeof out.MaxPlayers === 'number', 'MaxPlayers is read as a number');
  },
});

Deno.test({
  name: 'a real SandboxVars file parses, with labels on the headline settings',
  ignore: realLua === null,
  fn() {
    const out = parseSandboxVars(realLua!);
    assert(Object.keys(out).length > 200, 'expected hundreds of settings');
    assert(typeof out.Zombies?.label === 'string', 'Zombies has a label');
    assert(typeof out['ZombieLore.Speed']?.label === 'string', 'zombie speed has a label');
    assert(typeof out['MultiplierConfig.Global']?.v === 'number', 'the global XP multiplier is a number');
  },
});
