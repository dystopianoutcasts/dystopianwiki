# Animation System Documentation

**Location:** Multiple folders in `media/`
**Purpose:** Character and zombie animation definitions, state machines, and clip data

---

## Folder Structure

```
media/
├── AnimSets/                    # Animation set definitions
│   ├── player/                  # Player animation sets
│   ├── player-avatar/           # Avatar animation sets
│   ├── player-editor/           # Editor animation sets
│   ├── player-vehicle/          # Vehicle animation sets
│   ├── zombie/                  # Zombie animation sets
│   ├── zombie-crawler/          # Crawler zombie animations
│   ├── mannequin/               # Mannequin animations
│   ├── Master_Bones.xml         # Bone definitions
│   └── Master_Variables.xml     # Animation variables
├── actiongroups/                # Action group state machines
│   ├── player/                  # Player action groups
│   ├── player-avatar/           # Avatar action groups
│   ├── zombie/                  # Zombie action groups
│   └── zombie-crawler/          # Crawler action groups
├── animstates/                  # Animation state definitions
│   ├── testanimstates.xml       # Main animation states
│   └── testanimstates2.xml      # Additional states
└── anims_X/                     # Animation clip files
    ├── Bob/                     # Male character animations (1,128 files)
    ├── Kate/                    # Female character animations
    ├── Zombie/                  # Zombie animations (167 files)
    ├── Mannequin_Scarecrow/     # Scarecrow animations
    └── Mannequin_Skeleton/      # Skeleton animations
```

---

## Animation Sets (AnimSets/)

Animation sets define which animation clips belong to which character type.

### player.xml

```xml
<animSet>
    <animNodeFilter>
        <folderPrefixes>Bob</folderPrefixes>
        <folderPrefixes>Kate</folderPrefixes>
        <namePrefixes>Bob_</namePrefixes>
        <namePrefixes>Kate_</namePrefixes>
    </animNodeFilter>
</animSet>
```

### zombie.xml

```xml
<animSet>
    <animNodeFilter>
        <folderPrefixes>Zombie</folderPrefixes>
        <namePrefixes>Zombie_</namePrefixes>
    </animNodeFilter>
</animSet>
```

### Animation Set Types

| Set | Description |
|-----|-------------|
| player | Main player character |
| player-avatar | Avatar/preview character |
| player-editor | Animation editor |
| player-vehicle | In-vehicle animations |
| zombie | Standing zombie |
| zombie-crawler | Crawling zombie |
| mannequin | Mannequin objects |

---

## Bone Structure (Master_Bones.xml)

Defines the skeleton hierarchy:

### Root Bones
- `Dummy01` - Scene root
- `Bip01` - Character root

### Body Bones
- `Bip01_Pelvis` - Pelvis/hips
- `Bip01_Spine` - Lower spine
- `Bip01_Spine1` - Upper spine
- `Bip01_Neck` - Neck
- `Bip01_Head` - Head

### Arm Bones (Left/Right)
- `Bip01_L_Clavicle` / `Bip01_R_Clavicle` - Shoulders
- `Bip01_L_UpperArm` / `Bip01_R_UpperArm` - Upper arms
- `Bip01_L_Forearm` / `Bip01_R_Forearm` - Forearms
- `Bip01_L_Hand` / `Bip01_R_Hand` - Hands
- `Bip01_L_Finger0/1` / `Bip01_R_Finger0/1` - Fingers

### Leg Bones (Left/Right)
- `Bip01_L_Thigh` / `Bip01_R_Thigh` - Thighs
- `Bip01_L_Calf` / `Bip01_R_Calf` - Calves
- `Bip01_L_Foot` / `Bip01_R_Foot` - Feet
- `Bip01_L_Toe0` / `Bip01_R_Toe0` - Toes

### Special Bones
- `Bip01_BackPack` - Backpack attachment
- `Bip01_Prop1` - Primary prop/weapon
- `Bip01_Prop2` - Secondary prop
- `Bip01_DressFront` - Front dress physics
- `Bip01_DressBack` - Back dress physics
- `Translation_Data` - Root motion data

---

## Animation Variables (Master_Variables.xml)

Variables control animation blending and state:

| Variable | Description |
|----------|-------------|
| Aim | Is character aiming |
| Weapon | Currently equipped weapon |
| ipx | X-input while aiming |
| ipy | Y-input while aiming |
| turndelta | Rotation multiplier |
| ismoving | Movement while aiming |
| deltax | X-movement while aiming |
| deltay | Y-movement while aiming |
| movedelta | Movement multiplier |
| ang | Aiming angle |

---

## Action Groups (actiongroups/)

Action groups define state machine logic for character actions.

### actionGroup.xml

```xml
<actiongroup>
    <initial>idle</initial>
</actiongroup>
```

### State Folders

Each state is a folder containing:
- `childTags.xml` - Valid child states
- `movementTransitions.xml` - Movement state transitions
- `otherTransitions.xml` - Other transitions
- `timedActionsTransitions.xml` - Timed action transitions

### Player States

| State | Description |
|-------|-------------|
| idle | Standing still |
| movement | Basic movement |
| run | Running |
| sprint | Sprinting |
| strafe | Strafing movement |
| aim | Weapon aiming |
| aim-sneak | Aiming while sneaking |
| melee | Melee combat |
| ranged | Ranged combat |
| shove | Shoving zombies |
| turning | Turning in place |
| emote | Character emotes |
| climbfence | Climbing fences |
| climbwindow | Climbing through windows |
| climbwall | Climbing walls |
| climbrope | Climbing rope |
| climbdownrope | Descending rope |
| fishing | Fishing actions |
| fitness | Exercise actions |
| falldown | Falling |
| getup | Getting up |
| hitreaction | Hit reaction |
| knockeddown | Knocked to ground |
| death | Death animation |
| onground | On ground state |

---

## Transitions

### defaultTransitions.xml

Global transitions that apply to all states:

```xml
<transitions>
    <transition>
        <transitionTo>hitreaction</transitionTo>
        <conditions>
            <isTrue>hashitreaction</isTrue>
            <isFalse>hitpvp</isFalse>
        </conditions>
    </transition>
    <transition>
        <transitionTo>knockeddown</transitionTo>
        <conditions>
            <isTrue>bknockeddown</isTrue>
        </conditions>
    </transition>
</transitions>
```

### Transition Conditions

| Condition | Type | Description |
|-----------|------|-------------|
| isTrue | bool | Variable is true |
| isFalse | bool | Variable is false |
| eventOccurred | event | Event has fired |

### Movement Transitions

```xml
<transitions>
    <transition>
        <transitionTo>movement</transitionTo>
        <conditions>
            <isTrue>isMoving</isTrue>
        </conditions>
    </transition>
    <transition>
        <transitionTo>run</transitionTo>
        <conditions>
            <isTrue>isMoving</isTrue>
            <isFalse>aim</isFalse>
            <isTrue>isRunning</isTrue>
        </conditions>
    </transition>
    <transition>
        <transitionTo>sprint</transitionTo>
        <conditions>
            <isTrue>isMoving</isTrue>
            <isFalse>aim</isFalse>
            <isTrue>isSprinting</isTrue>
        </conditions>
    </transition>
</transitions>
```

---

## Child Tags (childTags.xml)

Define which substates can play within a state:

```xml
<childTags>
    <tag>actions</tag>
    <tag>turning</tag>
    <tag>shove</tag>
    <tag>maskingleft</tag>
    <tag>maskingright</tag>
    <tag>emote</tag>
    <tag>ext</tag>
    <tag>hitreactionpvp</tag>
    <tag>hitreactionhit</tag>
</childTags>
```

---

## Animation States (animstates/)

### State Definition Structure

```xml
<AnimData>
    <Blends>
        <MoveDelta>
            <Type>InverseExponential</Type>
            <Increase Multiplier="MoveSpeedChangeDelta">0.185</Increase>
            <Decrease Multiplier="MoveSpeedChangeDelta">0.125</Decrease>
        </MoveDelta>
    </Blends>
    <AnimStates>
        <BaseAnim>
            <Commands>
                <SetValue name="TurnDelta" value="1.5"/>
                <PlayAnim Anim="Bob_Idle" Repeat="-1" SpeedDelta="0.3" BlendTime="0.3" />
            </Commands>
            <Out>
            </Out>
        </BaseAnim>
    </AnimStates>
</AnimData>
```

### Blend Types

| Type | Description |
|------|-------------|
| Linear | Linear interpolation |
| InverseExponential | Smooth exponential blend |

### Animation Commands

| Command | Parameters | Description |
|---------|------------|-------------|
| PlayAnim | Anim, Repeat, SpeedDelta, BlendTime | Play animation clip |
| SetValue | name, value | Set animation variable |
| SetCollision | active | Enable/disable collision |

### PlayAnim Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| Anim | string | Animation clip name |
| Repeat | int | Repeat count (-1 = infinite) |
| SpeedDelta | float | Speed multiplier |
| BlendTime | float | Blend duration in seconds |
| CanCancel | bool | Can be interrupted |

---

## Animation Clips (anims_X/)

### File Format

Animation clips use `.X` (DirectX) format.

### Naming Convention

```
[Character]_[Action][Variant].X
```

Examples:
- `Bob_Idle.X` - Male idle
- `Bob_Walk.X` - Male walk
- `Bob_Attack1Hand01_Hit.X` - 1-handed attack (variant 1, hit)
- `Zombie_Walk.X` - Zombie walk
- `Zombie_Attack.X` - Zombie attack

### Animation Categories

**Movement:**
- Idle, Walk, Run, Sprint
- Strafe (left/right)
- Turn (left/right)

**Combat:**
- Attack1Hand (1-handed weapons)
- Attack2H (2-handed weapons)
- AttackBat (baseball bat)
- AttackChainsaw
- AttackSpear
- Shoot (firearms)

**Actions:**
- ClimbWindow, ClimbFence, ClimbWall
- OpenDoor, CloseDoor
- Loot, Search
- Build, Craft

**Reactions:**
- HitReact (getting hit)
- Death
- Stumble, Fall
- GetUp

**State Changes:**
- AimToIdle
- IdleToAim
- WalkToRun

---

## Animation Counts

| Character | Count | Description |
|-----------|-------|-------------|
| Bob | 1,128 | Male character |
| Kate | ~1,000 | Female character |
| Zombie | 167 | Zombie character |

---

## Lua Animation Access

```lua
-- Get animation model
local model = player:getModel()

-- Play animation
player:playAnimationWithFrame("Bob_Idle", true)

-- Get current animation
local anim = player:getCurrentState()

-- Set animation variable
player:setVariable("isMoving", true)

-- Get animation variable
local isAiming = player:getVariableBoolean("aim")
```

---

## Adding Custom Animations

### Step 1: Create Animation Clip

1. Create animation in 3D software (Blender, Maya, etc.)
2. Export as .X format
3. Match bone structure from Master_Bones.xml
4. Name following convention: `[Character]_[Action].X`

### Step 2: Add to AnimSet

```xml
<animSet>
    <animNodeFilter>
        <folderPrefixes>MyMod</folderPrefixes>
        <namePrefixes>MyMod_</namePrefixes>
    </animNodeFilter>
</animSet>
```

### Step 3: Define State Transition

Add transition in appropriate action group:

```xml
<transition>
    <transitionTo>mycustomstate</transitionTo>
    <conditions>
        <isTrue>myCustomVariable</isTrue>
    </conditions>
</transition>
```

### Step 4: Create State Definition

```xml
<MyCustomState>
    <Commands>
        <PlayAnim Anim="MyMod_CustomAnim" Repeat="0" SpeedDelta="1.0" BlendTime="0.3" />
    </Commands>
    <Out>
        <NormalMovement OutBlend="0.5"/>
    </Out>
</MyCustomState>
```

---

## Documentation Status

| Component | Status |
|-----------|--------|
| Folder structure | Complete |
| AnimSets | Complete |
| Bone structure | Complete |
| Animation variables | Complete |
| Action groups | Complete |
| Transitions | Complete |
| Animation states | Complete |
| Animation clips | Partial |
| Lua access | Basic |
| Custom animation guide | Basic |

---

## Key Patterns

### State Machine Flow
1. Action groups define valid states
2. Transitions define state changes
3. Child tags allow substates
4. Animation states define actual playback

### Naming Convention
- `Bob_` prefix for male animations
- `Kate_` prefix for female animations
- `Zombie_` prefix for zombie animations
- Action names follow consistent pattern

### Blend System
- BlendTime controls transition smoothness
- SpeedDelta controls playback speed
- MoveDelta/DeltaX/DeltaY control movement blending

---

## Next Steps

1. Document complete animation clip catalog
2. Document weapon-specific animations
3. Create animation export guide
4. Document animation event callbacks
