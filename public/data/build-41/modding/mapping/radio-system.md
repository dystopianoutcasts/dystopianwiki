# radio/ Folder Documentation

**Location:** `media/radio/`
**Purpose:** Radio and TV broadcast content, channel definitions, schedules

---

## Folder Structure

```
radio/
├── RadioData.xml      # Main broadcast data (1.4MB)
├── RadioData_CH.txt   # Chinese (Traditional) translation
├── RadioData_CN.txt   # Chinese (Simplified) translation
├── RadioData_DE.txt   # German translation
├── RadioData_ES.txt   # Spanish translation
├── RadioData_FR.txt   # French translation
├── RadioData_HU.txt   # Hungarian translation
├── RadioData_IT.txt   # Italian translation
├── RadioData_JP.txt   # Japanese translation
├── RadioData_KO.txt   # Korean translation
├── RadioData_PL.txt   # Polish translation
├── RadioData_PTBR.txt # Portuguese (Brazilian) translation
├── RadioData_RU.txt   # Russian translation
├── RadioData_TH.txt   # Thai translation
└── RadioData_TR.txt   # Turkish translation
```

---

## RadioData.xml Structure

### Root Structure

```xml
<?xml version="1.0" encoding="utf-8"?>
<RadioData>
    <RootInfo>
        <SourceFile>Radio</SourceFile>
        <FileGUID>unique-guid</FileGUID>
        <Version>1</Version>
    </RootInfo>

    <Voices>
        <!-- Voice color definitions -->
    </Voices>

    <Adverts>
        <!-- Advertisement segments -->
    </Adverts>

    <ChannelEntry>
        <!-- Radio/TV channel definitions -->
    </ChannelEntry>
</RadioData>
```

---

## Channels

### Radio Channels

| Name | Frequency | Category | Description |
|------|-----------|----------|-------------|
| LBMW - Kentucky Radio | 93.2 MHz | Radio | Kentucky local radio |
| NNR Radio | 98.0 MHz | Radio | News radio station |
| KnoxTalk Radio | 101.2 MHz | Radio | Talk radio |
| Hitz FM | 89.4 MHz | Radio | Music station |

### Television Channels

| Name | Channel | Category | Description |
|------|---------|----------|-------------|
| Triple-N | 200 | Television | News network |
| WBLN News | 201 | Television | Local news |
| Life and Living TV | 203 | Television | Lifestyle programming |
| TURBO | 204 | Television | Action/Cars |
| PawsTV | 205 | Television | Children's programming |

### Special Channels

| Name | Frequency | Category | Description |
|------|-----------|----------|-------------|
| Civilian Radio | 91.2 MHz | Amateur | Survivor communications |
| Unknown Frequency | 107.6 MHz | Amateur | Mystery broadcasts |
| Classified M1A1 | 95.0 MHz | Military | Military communications |

---

## Channel Entry Structure

```xml
<ChannelEntry
    ID="unique-guid"
    name="Channel Name"
    cat="Radio/Television/Amateur/Military"
    freq="93200"
    startscript="main">

    <ScriptEntry ID="guid" name="script_name" startdelay="0" timestampmode="Static" loopmin="1" loopmax="1">
        <!-- Broadcast content -->
    </ScriptEntry>

</ChannelEntry>
```

### Channel Properties

| Property | Description |
|----------|-------------|
| ID | Unique GUID identifier |
| name | Display name of the channel |
| cat | Category: Radio, Television, Amateur, Military |
| freq | Frequency in kHz (93200 = 93.2 MHz) or channel number |
| startscript | Initial script to run |

---

## Scripts

Scripts define broadcast sequences that play on channels.

### Script Types

| Script Name | Purpose |
|-------------|---------|
| main | Main broadcast content |
| init_infection | Pre-outbreak content |
| emergency | Emergency broadcasts |
| static | Static/dead air |
| Jonas | Named survivor broadcasts |
| pastor | Religious broadcasts |
| numbers | Number station broadcasts |
| kanibals | Survivor group broadcasts |

### Script Entry Structure

```xml
<ScriptEntry
    ID="guid"
    name="script_name"
    startdelay="0"
    timestampmode="Static"
    loopmin="1"
    loopmax="1">

    <ExitOptions />

    <BroadcastEntry>
        <!-- Broadcast content -->
    </BroadcastEntry>

</ScriptEntry>
```

### Script Properties

| Property | Description |
|----------|-------------|
| ID | Unique GUID |
| name | Script identifier |
| startdelay | Delay before starting (game hours) |
| timestampmode | Static or Dynamic timing |
| loopmin | Minimum loop count |
| loopmax | Maximum loop count |

---

## Broadcast Entries

Broadcast entries contain the actual dialogue and content.

```xml
<BroadcastEntry
    ID="guid"
    timestamp="0"
    endstamp="0"
    type="ActivateBroadcast"
    day="0"
    advertCat="none"
    isSegment="true">

    <LineEntry ID="guid" r="255" g="192" b="0">
        Dialogue text here
    </LineEntry>

</BroadcastEntry>
```

### Broadcast Properties

| Property | Description |
|----------|-------------|
| ID | Unique GUID |
| timestamp | Start time (game hours from start) |
| endstamp | End time |
| type | ActivateBroadcast, DeactivateBroadcast |
| day | In-game day (0 = first day) |
| advertCat | Advertisement category |
| isSegment | Whether this is a segment |

---

## Line Entries

Individual dialogue lines with speaker colors.

```xml
<LineEntry ID="guid" r="255" g="192" b="0">
    Spoken text here
</LineEntry>
```

### Line Properties

| Property | Description |
|----------|-------------|
| ID | Unique GUID |
| r, g, b | Speaker color (RGB 0-255) |
| Text content | The actual dialogue |

### Special Text Tags

| Tag | Purpose |
|-----|---------|
| `[img=music]` | Music note icon |
| `*sound effect*` | Sound effect description |
| `"quoted text"` | Character speech |

---

## Voice Colors

Pre-defined voice colors for different speakers:

```xml
<Voices>
    <VoiceEntry ID="guid">
        <FinalColor r="255" g="192" b="0" />  <!-- Gold/Yellow -->
    </VoiceEntry>
    <VoiceEntry ID="guid">
        <FinalColor r="0" g="176" b="80" />   <!-- Green -->
    </VoiceEntry>
    <VoiceEntry ID="guid">
        <FinalColor r="128" g="128" b="255" /> <!-- Light Blue -->
    </VoiceEntry>
    <VoiceEntry ID="guid">
        <FinalColor r="255" g="0" b="0" />    <!-- Red -->
    </VoiceEntry>
</Voices>
```

### Common Voice Colors

| RGB | Color | Typical Use |
|-----|-------|-------------|
| 255,192,0 | Gold | Main announcer |
| 0,176,80 | Green | Secondary voice |
| 128,128,255 | Light Blue | Narrator |
| 255,0,0 | Red | Urgent/Alert |
| 0,0,0 | Black | Sound effects |
| 0,176,240 | Cyan | Female voice |
| 255,0,255 | Magenta | Special |

---

## Advertisements

Advertisements are segments that play during broadcasts.

```xml
<Adverts>
    <ScriptEntry ID="guid" name="Tv" startdelay="0" timestampmode="Static" loopmin="1" loopmax="1">
        <BroadcastEntry ID="guid" timestamp="0" endstamp="0" type="ActivateBroadcast" day="0" advertCat="none" isSegment="true">
            <!-- Ad content -->
        </BroadcastEntry>
    </ScriptEntry>
</Adverts>
```

### Advertisement Categories

| Category | Description |
|----------|-------------|
| Tv | Television advertisements |
| Radio | Radio advertisements |
| none | Generic/all channels |

### Known Advertisements

**Restaurants/Food:**
- Pizza Whirled
- Spiffo's
- Seahorse Coffee
- Churn R' Us Ice Cream
- Wok and Rolls
- Greene's Grocery
- Pile O' Crepe

**Gas Stations:**
- Fossoil
- Gas 2 Go
- Thunder Gas

**Products:**
- Orange-Lite Pop
- Incontileve (medicine)
- Tooks Bear (toy)
- ValuInsurance

**Movies:**
- PAWS: The Movie
- The Forgotten Element
- Dr. Oids

**Stores:**
- Fashionabelle (clothing)
- Pharmahug (pharmacy)

---

## Timeline System

Broadcasts are scheduled based on in-game time:

### Day System
- `day="0"` = First day of outbreak
- `day="1"` = Second day
- Each day represents 24 in-game hours

### Timestamp System
- `timestamp="0"` = Start of day (midnight)
- Values in game hours from day start
- Used to schedule specific broadcasts

### Progression Phases

1. **Pre-Outbreak (init_infection)**
   - Normal programming
   - Regular commercials
   - No emergency content

2. **Early Outbreak (main, day 0-2)**
   - Initial news reports
   - Emergency alerts begin
   - Some confusion

3. **Full Crisis (main, day 3+)**
   - Emergency broadcasts dominate
   - Survivor communications
   - Military announcements

4. **Post-Collapse (static)**
   - Dead air
   - Occasional survivor signals

---

## Translation Files

Translation files (.txt) contain localized dialogue text.

Format: Line-by-line translation matching RadioData.xml LineEntry order.

Supported languages:
- CH: Chinese (Traditional)
- CN: Chinese (Simplified)
- DE: German
- ES: Spanish
- FR: French
- HU: Hungarian
- IT: Italian
- JP: Japanese
- KO: Korean
- PL: Polish
- PTBR: Portuguese (Brazil)
- RU: Russian
- TH: Thai
- TR: Turkish

---

## Adding Custom Radio Content

### Step 1: Create Channel

```xml
<ChannelEntry
    ID="generate-unique-guid"
    name="My Radio Station"
    cat="Radio"
    freq="95500"
    startscript="main">

    <!-- Scripts go here -->

</ChannelEntry>
```

### Step 2: Create Script

```xml
<ScriptEntry ID="guid" name="main" startdelay="0" timestampmode="Static" loopmin="1" loopmax="1">
    <ExitOptions />

    <BroadcastEntry ID="guid" timestamp="0" endstamp="0" type="ActivateBroadcast" day="0" advertCat="none" isSegment="true">
        <LineEntry ID="guid" r="255" g="200" b="0">Welcome to My Radio Station!</LineEntry>
        <LineEntry ID="guid" r="0" g="176" b="80">This is your host speaking.</LineEntry>
    </BroadcastEntry>

</ScriptEntry>
```

### Step 3: Add Timeline Events

```xml
<!-- Day 0, morning -->
<BroadcastEntry ID="guid" timestamp="6" endstamp="12" type="ActivateBroadcast" day="0">
    <LineEntry ID="guid" r="255" g="200" b="0">Good morning listeners!</LineEntry>
</BroadcastEntry>

<!-- Day 1, evening -->
<BroadcastEntry ID="guid" timestamp="18" endstamp="24" type="ActivateBroadcast" day="1">
    <LineEntry ID="guid" r="255" g="200" b="0">Evening report time...</LineEntry>
</BroadcastEntry>
```

---

## Lua Integration

Access radio system from Lua:

```lua
-- Get radio data
local radioData = getWorld():getRadioData()

-- Get channel by frequency
local channel = radioData:getChannel(93200)

-- Check if broadcasting
local isBroadcasting = channel:isBroadcasting()

-- Get current script
local currentScript = channel:getCurrentScript()
```

---

## Documentation Status

| Component | Status |
|-----------|--------|
| Channel structure | Complete |
| Known channels | Complete |
| Script system | Complete |
| Broadcast entries | Complete |
| Voice colors | Complete |
| Advertisements | Complete |
| Timeline system | Complete |
| Translation files | Complete |
| Lua integration | Partial |
| Custom content guide | Complete |

---

## Key Patterns

### GUID Generation
- Every entry needs a unique GUID
- Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Frequency Format
- Radio: kHz (93200 = 93.2 MHz)
- TV: Channel numbers (200, 201, etc.)

### Color Consistency
- Use consistent colors for each speaker
- Define in Voices section for reuse
- RGB values 0-255

---

## Next Steps

1. Document complete timeline for each channel
2. Create advertisement catalog
3. Document all voice actors/colors
4. Create radio content creation tutorial
