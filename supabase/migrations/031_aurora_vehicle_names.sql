-- Migration 031: vehicle display names for the live map
-- Created: 2026-10-02
-- Description: the map shows "Taxi" instead of "Base.CarTaxi". Depends on 008
--              (the aurora schema and its USAGE grant). Needs exporter 0.5.1 for
--              names of modded cars; the seed below carries the vanilla Build 42
--              names, so the map has names before that exporter ships. Applying
--              this before the new aurora-ingest is deployed is harmless: the
--              ingest's write is optional and skips a missing table.
--
-- What is stored and what is public:
--
--   aurora.vehicle_names           one row per vehicle SCRIPT (not per car, and not per
--                                  server: a script name means the same car on every
--                                  server): script_name (the full name, "Base.CarTaxi",
--                                  exactly what aurora.vehicles.script_name holds),
--                                  display_name, updated_at.
--   aurora.vehicle_names_visible   the public view the map reads: script_name and
--                                  display_name, nothing else.
--
-- It is all public. A car's name is on its own tooltip in game, and the list is the
-- game's own text, so none of 022's reasoning about hiding columns applies and no
-- SECURITY DEFINER function is needed: the table takes the 009 `players` pattern
-- (a column-level SELECT grant for anon and authenticated plus a USING (TRUE)
-- policy), and the view is security_invoker so the caller's own column grant is
-- what is checked. updated_at stays ungranted: it is bookkeeping, not map data.
-- Writes have no client grant and no policy; the ingest uses service_role.
--
-- The seed. 231 vanilla English names, generated from the game's own files by
-- scripts/aurora-vehicle-names-seed.ts (the EN IG_UI.json plus the vehicle scripts,
-- by vanilla's own rule). Seed rows carry updated_at = the epoch, so they are
-- recognisable, and they are inserted with ON CONFLICT DO NOTHING: running this file
-- again never overwrites a name the exporter has sent since. The exporter's rows go
-- in with ON CONFLICT DO UPDATE (PostgREST merge-duplicates on script_name), so an
-- exporter name replaces its seed row.
--
-- aurora.home_summary / home_summary_tz are NOT touched: they return counts, never a
-- vehicle name.
--
-- Safe to run twice. Run it as postgres (the SQL editor).

-- ============================================================================
-- 1. TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS aurora.vehicle_names (
  script_name  TEXT PRIMARY KEY CHECK (script_name <> '' AND char_length(script_name) <= 120),
  display_name TEXT NOT NULL CHECK (display_name <> '' AND char_length(display_name) <= 120),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE aurora.vehicle_names IS
  'Display name per vehicle script (031). Seeded with the vanilla English names (updated_at = the epoch); the exporter (0.5.1) overwrites and extends it. Public through aurora.vehicle_names_visible.';
COMMENT ON COLUMN aurora.vehicle_names.script_name IS
  'The full script name, "Base.CarTaxi": what the exporter''s veh records send and aurora.vehicles.script_name holds.';

ALTER TABLE aurora.vehicle_names ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON aurora.vehicle_names FROM PUBLIC, anon, authenticated;
GRANT SELECT (script_name, display_name) ON aurora.vehicle_names TO anon, authenticated;
GRANT ALL ON aurora.vehicle_names TO service_role;

DROP POLICY IF EXISTS "aurora vehicle names are publicly readable" ON aurora.vehicle_names;
CREATE POLICY "aurora vehicle names are publicly readable"
  ON aurora.vehicle_names FOR SELECT USING (TRUE);

-- ============================================================================
-- 2. THE PUBLIC VIEW
-- ============================================================================

DROP VIEW IF EXISTS aurora.vehicle_names_visible;
CREATE VIEW aurora.vehicle_names_visible
WITH (security_invoker = TRUE) AS
  SELECT script_name, display_name
    FROM aurora.vehicle_names;

REVOKE ALL ON aurora.vehicle_names_visible FROM PUBLIC, anon, authenticated;
GRANT SELECT ON aurora.vehicle_names_visible TO anon, authenticated, service_role;

COMMENT ON VIEW aurora.vehicle_names_visible IS
  'The map reads this for car names (031): script_name -> display_name. A script with no row has no name; the map falls back to its own.';

-- ============================================================================
-- 3. THE SEED
-- ============================================================================

-- BEGIN GENERATED SEED (scripts/aurora-vehicle-names-seed.ts)
-- 231 vanilla Build 42 vehicles. Re-generate, do not hand-edit.
INSERT INTO aurora.vehicle_names (script_name, display_name, updated_at)
SELECT v.script_name, v.display_name, TIMESTAMPTZ '1970-01-01 00:00:00+00'
FROM (VALUES
  ('Base.AmbulanceBurnt', 'Burnt Ambulance'),
  ('Base.CarLightsBulletinSheriff', 'Bulletin Sheriff Chevalier Nyala'),
  ('Base.CarLightsKST', 'State Trooper Chevalier Nyala'),
  ('Base.CarLightsLouisvilleCounty', 'LCPD Chevalier Nyala'),
  ('Base.CarLightsMuldraughPolice', 'Muldraugh Police Chevalier Nyala'),
  ('Base.CarLightsPolice', 'Police Chevalier Nyala'),
  ('Base.CarLightsRanger', 'Ranger Chevalier Nyala'),
  ('Base.CarLightsSmashedFront', 'Wrecked Chevalier Nyala'),
  ('Base.CarLightsSmashedLeft', 'Wrecked Chevalier Nyala'),
  ('Base.CarLightsSmashedRear', 'Wrecked Chevalier Nyala'),
  ('Base.CarLightsSmashedRight', 'Wrecked Chevalier Nyala'),
  ('Base.CarLuxury', 'Mercia Lang 4000'),
  ('Base.CarLuxurySmashedFront', 'Wrecked Mercia Lang 4000'),
  ('Base.CarLuxurySmashedLeft', 'Wrecked Mercia Lang 4000'),
  ('Base.CarLuxurySmashedRear', 'Wrecked Mercia Lang 4000'),
  ('Base.CarLuxurySmashedRight', 'Wrecked Mercia Lang 4000'),
  ('Base.CarNormal', 'Chevalier Nyala'),
  ('Base.CarNormalBurnt', 'Burnt Chevalier Nyala'),
  ('Base.CarNormalSmashedFront', 'Wrecked Chevalier Nyala'),
  ('Base.CarNormalSmashedLeft', 'Wrecked Chevalier Nyala'),
  ('Base.CarNormalSmashedRear', 'Wrecked Chevalier Nyala'),
  ('Base.CarNormalSmashedRight', 'Wrecked Chevalier Nyala'),
  ('Base.CarSmall02SmashedFront', 'Wrecked Masterson Horizon'),
  ('Base.CarSmall02SmashedLeft', 'Wrecked Masterson Horizon'),
  ('Base.CarSmall02SmashedRear', 'Wrecked Masterson Horizon'),
  ('Base.CarSmall02SmashedRight', 'Wrecked Masterson Horizon'),
  ('Base.CarSmallSmashedFront', 'Wrecked Chevalier Dart'),
  ('Base.CarSmallSmashedLeft', 'Wrecked Chevalier Dart'),
  ('Base.CarSmallSmashedRear', 'Wrecked Chevalier Dart'),
  ('Base.CarSmallSmashedRight', 'Wrecked Chevalier Dart'),
  ('Base.CarStationWagon', 'Chevalier Cerise Wagon'),
  ('Base.CarStationWagon2', 'Chevalier Cerise Wagon'),
  ('Base.CarStationWagonSmashedFront', 'Wrecked Chevalier Cerise Wagon'),
  ('Base.CarStationWagonSmashedLeft', 'Wrecked Chevalier Cerise Wagon'),
  ('Base.CarStationWagonSmashedRear', 'Wrecked Chevalier Cerise Wagon'),
  ('Base.CarStationWagonSmashedRight', 'Wrecked Chevalier Cerise Wagon'),
  ('Base.CarTaxi', 'Taxi'),
  ('Base.CarTaxi2', 'Taxi'),
  ('Base.LuxuryCarBurnt', 'Burnt Mercia Lang 4000'),
  ('Base.ModernCar', 'Dash Elite'),
  ('Base.ModernCar02', 'Chevalier Primani'),
  ('Base.ModernCar02Burnt', 'Burnt Chevalier Primani'),
  ('Base.ModernCarBurnt', 'Burnt Dash Elite'),
  ('Base.ModernCarLightsCityLouisvillePD', 'Louisville Police Dash Elite'),
  ('Base.ModernCarLightsMeadeSheriff', 'Meade Sheriff Dash Elite'),
  ('Base.ModernCarLightsWestPoint', 'West Point Police Dash Elite'),
  ('Base.NormalCarBurntPolice', 'Burnt Chevalier Nyala'),
  ('Base.OffRoad', 'Dash Rancher'),
  ('Base.OffRoadBurnt', 'Burnt Dash Rancher'),
  ('Base.OffRoadSmashedFront', 'Wrecked Dash Rancher'),
  ('Base.OffRoadSmashedLeft', 'Wrecked Dash Rancher'),
  ('Base.OffRoadSmashedRear', 'Wrecked Dash Rancher'),
  ('Base.OffRoadSmashedRight', 'Wrecked Dash Rancher'),
  ('Base.PickUpTruck', 'Chevalier D6'),
  ('Base.PickUpTruckJPLandscaping', 'JP Landscaping Chevalier D6'),
  ('Base.PickUpTruckLightsAirport', 'Airport Chevalier D6'),
  ('Base.PickUpTruckLightsAirportSecurity', 'Airport Security Chevalier D6'),
  ('Base.PickUpTruckLightsFire', 'Fire Department Chevalier D6'),
  ('Base.PickUpTruckLightsFossoil', 'Chevalier D6'),
  ('Base.PickUpTruckLightsRanger', 'Ranger Chevalier D6'),
  ('Base.PickUpTruckLightsSmashedFront', 'Wrecked Chevalier D6'),
  ('Base.PickUpTruckLightsSmashedLeft', 'Wrecked Chevalier D6'),
  ('Base.PickUpTruckLightsSmashedRear', 'Wrecked Chevalier D6'),
  ('Base.PickUpTruckLightsSmashedRight', 'Wrecked Chevalier D6'),
  ('Base.PickUpTruckMccoy', 'McCoy Chevalier D6'),
  ('Base.PickUpTruckSmashedFront', 'Wrecked Chevalier D6'),
  ('Base.PickUpTruckSmashedLeft', 'Wrecked Chevalier D6'),
  ('Base.PickUpTruckSmashedRear', 'Wrecked Chevalier D6'),
  ('Base.PickUpTruckSmashedRight', 'Wrecked Chevalier D6'),
  ('Base.PickUpTruck_Camo', 'Chevalier D6'),
  ('Base.PickUpVan', 'Dash Bulldriver'),
  ('Base.PickUpVanBrickingIt', 'Bricking It Dash Bulldriver'),
  ('Base.PickUpVanBuilder', 'Builder''s Dash Bulldriver'),
  ('Base.PickUpVanBurnt', 'Burnt Dash Bulldriver'),
  ('Base.PickUpVanCallowayLandscaping', 'Dash Bulldriver'),
  ('Base.PickUpVanHeltonMetalWorking', 'Helton Metalworking Dash Bulldriver'),
  ('Base.PickUpVanKimbleKonstruction', 'Kimbler Konstruction Dash Bulldriver'),
  ('Base.PickUpVanLightsBurnt', 'Burnt Dash Bulldriver'),
  ('Base.PickUpVanLightsCarpenter', 'Carpenter''s Dash Bulldriver'),
  ('Base.PickUpVanLightsFire', 'Fire Department Dash Bulldriver'),
  ('Base.PickUpVanLightsFossoil', 'Dash Bulldriver'),
  ('Base.PickUpVanLightsKentuckyLumber', 'Dash Bulldriver'),
  ('Base.PickUpVanLightsLouisvilleCounty', 'LCPD Dash Bulldriver'),
  ('Base.PickUpVanLightsPolice', 'Police Dash Bulldriver'),
  ('Base.PickUpVanLightsRanger', 'Ranger Dash Bulldriver'),
  ('Base.PickUpVanLightsSmashedFront', 'Wrecked Dash Bulldriver'),
  ('Base.PickUpVanLightsSmashedLeft', 'Wrecked Dash Bulldriver'),
  ('Base.PickUpVanLightsSmashedRear', 'Wrecked Dash Bulldriver'),
  ('Base.PickUpVanLightsSmashedRight', 'Wrecked Dash Bulldriver'),
  ('Base.PickUpVanLightsStatePolice', 'State Trooper Dash Bulldriver'),
  ('Base.PickUpVanMarchRidgeConstruction', 'Dash Bulldriver'),
  ('Base.PickUpVanMccoy', 'McCoy Dash Bulldriver'),
  ('Base.PickUpVanMetalworker', 'Metalworker''s Dash Bulldriver'),
  ('Base.PickUpVanSmashedFront', 'Wrecked Dash Bulldriver'),
  ('Base.PickUpVanSmashedLeft', 'Wrecked Dash Bulldriver'),
  ('Base.PickUpVanSmashedRear', 'Wrecked Dash Bulldriver'),
  ('Base.PickUpVanSmashedRight', 'Wrecked Dash Bulldriver'),
  ('Base.PickUpVanWeldingbyCamille', 'Welding by Camille Dash Bulldriver'),
  ('Base.PickUpVanYingsWood', 'Van Yings Wood Dash Bulldriver'),
  ('Base.PickUpVan_Camo', 'Dash Bulldriver'),
  ('Base.PickupBurnt', 'Burnt Chevalier D6'),
  ('Base.PickupSpecialBurnt', 'Burnt Chevalier D6'),
  ('Base.RaceCar12', 'Race Car'),
  ('Base.RaceCar34', 'Race Car'),
  ('Base.RaceCar58', 'Race Car'),
  ('Base.RaceCarBurnt', 'Burnt Race Car'),
  ('Base.SUV', 'Franklin All-Terrain'),
  ('Base.SUVBurnt', 'Burnt Franklin All-Terrain'),
  ('Base.SUVSmashedFront', 'Wrecked Franklin All-Terrain'),
  ('Base.SUVSmashedLeft', 'Wrecked Franklin All-Terrain'),
  ('Base.SUVSmashedRear', 'Wrecked Franklin All-Terrain'),
  ('Base.SUVSmashedRight', 'Wrecked Franklin All-Terrain'),
  ('Base.SmallCar', 'Chevalier Dart'),
  ('Base.SmallCar02', 'Masterson Horizon'),
  ('Base.SmallCar02Burnt', 'Burnt Masterson Horizon'),
  ('Base.SmallCarBurnt', 'Burnt Chevalier Dart'),
  ('Base.SportsCar', 'Chevalier Cossette'),
  ('Base.SportsCarBurnt', 'Burnt Chevalier Cossette'),
  ('Base.StepVan', 'Chevalier Step Van'),
  ('Base.StepVanAirportCatering', 'Airport Catering Chevalier Step Van'),
  ('Base.StepVanMail', 'Mail Chevalier Step Van'),
  ('Base.StepVanMailSmashedFront', 'Wrecked Chevalier Step Van'),
  ('Base.StepVanMailSmashedLeft', 'Wrecked Chevalier Step Van'),
  ('Base.StepVanMailSmashedRear', 'Wrecked Chevalier Step Van'),
  ('Base.StepVanMailSmashedRight', 'Wrecked Chevalier Step Van'),
  ('Base.StepVanSmashedFront', 'Wrecked Chevalier Step Van'),
  ('Base.StepVanSmashedLeft', 'Wrecked Chevalier Step Van'),
  ('Base.StepVanSmashedRear', 'Wrecked Chevalier Step Van'),
  ('Base.StepVanSmashedRight', 'Wrecked Chevalier Step Van'),
  ('Base.StepVan_Blacksmith', 'Chevalier Step Van'),
  ('Base.StepVan_Butchers', 'Chevalier Step Van'),
  ('Base.StepVan_Cereal', 'Chevalier Step Van'),
  ('Base.StepVan_Citr8', 'Chevalier Step Van'),
  ('Base.StepVan_CompleteRepairShop', 'Complete Repair Shop Chevalier Step Van'),
  ('Base.StepVan_Florist', 'Chevalier Step Van'),
  ('Base.StepVan_Genuine_Beer', 'Chevalier Step Van'),
  ('Base.StepVan_Glass', 'Chevalier Step Van'),
  ('Base.StepVan_Heralds', 'KY Herald Chevalier Step Van'),
  ('Base.StepVan_HuangsLaundry', 'Huang''s Laundry Chevalier Step Van'),
  ('Base.StepVan_Jorgensen', 'Jorgensen Chevalier Step Van'),
  ('Base.StepVan_LouisvilleMotorShop', 'Louisville Motorshop Chevalier Step Van'),
  ('Base.StepVan_LouisvilleSWAT', 'Chevalier Step Van'),
  ('Base.StepVan_MarineBites', 'Marine Bites Chevalier Step Van'),
  ('Base.StepVan_Masonry', 'Chevalier Step Van'),
  ('Base.StepVan_Mechanic', 'Mechanic''s Chevalier Step Van'),
  ('Base.StepVan_MobileLibrary', 'Chevalier Step Van'),
  ('Base.StepVan_Plonkies', 'Plonkies Chevalier Step Van'),
  ('Base.StepVan_Propane', 'Chevalier Step Van'),
  ('Base.StepVan_RandisPlants', 'Randi''s Plants Chevalier Step Van'),
  ('Base.StepVan_Scarlet', 'Scarlet Oak Chevalier Step Van'),
  ('Base.StepVan_SmartKut', 'Chevalier Step Van'),
  ('Base.StepVan_SouthEasternHosp', 'South Eastern Hospitality Chevalier Step Van'),
  ('Base.StepVan_SouthEasternPaint', 'South Eastern Paint Chevalier Step Van'),
  ('Base.StepVan_USL', 'USL Chevalier Step Van'),
  ('Base.StepVan_Zippee', 'Zippee Chevalier Step Van'),
  ('Base.TaxiBurnt', 'Burnt Taxi'),
  ('Base.Trailer', 'Trailer'),
  ('Base.TrailerAdvert', 'Trailer'),
  ('Base.TrailerCover', 'Trailer'),
  ('Base.Trailer_Horsebox', 'Horse trailer'),
  ('Base.Trailer_Livestock', 'Livestock Trailer'),
  ('Base.Van', 'Franklin Valuline'),
  ('Base.VanAmbulance', 'Ambulance'),
  ('Base.VanBeckmans', 'Franklin Valuline'),
  ('Base.VanBrewsterHarbin', 'Brewster & Harbin Franklin Valuline'),
  ('Base.VanBuilder', 'Builder''s Franklin Valuline'),
  ('Base.VanBurnt', 'Burnt Franklin Valuline'),
  ('Base.VanCarpenter', 'Carpenter''s Franklin Valuline'),
  ('Base.VanCoastToCoast', 'Coast 2 Coast Franklin Valuline'),
  ('Base.VanDeerValley', 'Deer Valley Power Franklin Valuline'),
  ('Base.VanFossoil', 'Franklin Valuline'),
  ('Base.VanGardenGods', 'Garden Gods Franklin Valuline'),
  ('Base.VanGardener', 'Gardener''s Franklin Valuline'),
  ('Base.VanGreenes', 'Franklin Valuline'),
  ('Base.VanJohnMcCoy', 'John McCoy Woodworking Franklin Valuline'),
  ('Base.VanJonesFabrication', 'Jones Fabrication Franklin Valuline'),
  ('Base.VanKerrHomes', 'Kerr Homes Franklin Valuline'),
  ('Base.VanKnobCreekGas', 'Knob Creek Gas Franklin Valuline'),
  ('Base.VanKnoxCom', 'Knox Telecommunications Franklin Valuline'),
  ('Base.VanKorshunovs', 'Korshunov''s Car Center Franklin Valuline'),
  ('Base.VanLouisvilleLandscaping', 'Louisville Landscaping Franklin Valuline'),
  ('Base.VanMail', 'Franklin Valuline'),
  ('Base.VanMccoy', 'McCoy Franklin Valuline'),
  ('Base.VanMechanic', 'Mechanic''s Franklin Valuline'),
  ('Base.VanMeltingPointMetal', 'Melting Point Metal Franklin Valuline'),
  ('Base.VanMetalheads', 'Metalheads Franklin Valuline'),
  ('Base.VanMetalworker', 'Metalworker''s Franklin Valuline'),
  ('Base.VanMicheles', 'Michele''s Woodshop Franklin Valuline'),
  ('Base.VanMobileMechanics', 'Mobile Mechanics Franklin Valuline'),
  ('Base.VanMooreMechanics', 'Moore Mechanics Franklin Valuline'),
  ('Base.VanOldMill', 'Old Mill Water Company Franklin Valuline'),
  ('Base.VanOvoFarm', 'Franklin Valuline'),
  ('Base.VanPennSHam', 'Penn S. Ham Construction Franklin Valuline'),
  ('Base.VanPlattAuto', 'Platt Auto Repair Franklin Valuline'),
  ('Base.VanPluggedInElectrics', 'Plugged In Electrics Franklin Valuline'),
  ('Base.VanRadio', 'LBMW Radio Van'),
  ('Base.VanRadioBurnt', 'Burnt LBMW Radio Van'),
  ('Base.VanRadio_3N', 'Triple-N Van'),
  ('Base.VanRiversideFabrication', 'Riverside Fabrication Franklin Valuline'),
  ('Base.VanRosewoodworking', 'Rosewoodworking Franklin Valuline'),
  ('Base.VanSchwabSheetMetal', 'Schwab Sheet Metal Franklin Valuline'),
  ('Base.VanSeats', 'Franklin Valuline'),
  ('Base.VanSeatsAirportShuttle', 'Airport Franklin Valuline'),
  ('Base.VanSeatsBurnt', 'Burnt Franklin Valuline'),
  ('Base.VanSeats_Creature', 'Creature Cruiser'),
  ('Base.VanSeats_LadyDelighter', 'The Lady Delighter'),
  ('Base.VanSeats_Mural', 'Franklin Valuline'),
  ('Base.VanSeats_Prison', 'Prisoner Transport Franklin Valuline'),
  ('Base.VanSeats_Space', 'Quantum Vessel'),
  ('Base.VanSeats_Trippy', 'Mesmer Wagon'),
  ('Base.VanSeats_Valkyrie', 'Valkyrie''s Spear'),
  ('Base.VanSpiffo', 'Spiffo Van'),
  ('Base.VanTreyBaines', 'Trey Baines Franklin Valuline'),
  ('Base.VanUncloggers', 'Uncloggers Franklin Valuline'),
  ('Base.VanUtility', 'Utility Franklin Valuline'),
  ('Base.VanWPCarpentry', 'WP Carpentry Franklin Valuline'),
  ('Base.Van_Blacksmith', 'Franklin Valuline'),
  ('Base.Van_BugWipers', 'Bug Wipers Franklin Valuline'),
  ('Base.Van_Charlemange_Beer', 'Franklin Valuline'),
  ('Base.Van_CraftSupplies', 'Franklin Valuline'),
  ('Base.Van_Glass', 'Franklin Valuline'),
  ('Base.Van_HeritageTailors', 'Franklin Valuline'),
  ('Base.Van_KnoxDisti', 'Knox Distillery Franklin Valuline'),
  ('Base.Van_Leather', 'Franklin Valuline'),
  ('Base.Van_LectroMax', 'Lectromax Franklin Valuline'),
  ('Base.Van_Locksmith', 'Franklin Valuline'),
  ('Base.Van_Masonry', 'Franklin Valuline'),
  ('Base.Van_MassGenFac', 'Mass GenFac Franklin Valuline'),
  ('Base.Van_Perfick_Potato', 'Franklin Valuline'),
  ('Base.Van_Transit', 'Transit Franklin Valuline'),
  ('Base.Van_VoltMojo', 'Volt Mojo Franklin Valuline')
) AS v (script_name, display_name)
ON CONFLICT (script_name) DO NOTHING;
-- END GENERATED SEED
