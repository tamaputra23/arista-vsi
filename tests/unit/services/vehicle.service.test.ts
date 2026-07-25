import { upsertVehicle, listVehicles, getVehicleByExternalId } from "../../../src/services/vehicle.service";
import { cleanDatabase, seedTestData, disconnect } from "../../helpers/db";
import { ConflictError, NotFoundError } from "../../../src/lib/errors";

beforeAll(async () => {
  await seedTestData();
});

afterEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await disconnect();
});

const validInput = {
  external_id: "UNIT-001",
  company_code: "PT-AKA",
  branch_code: "JKT01",
  brand: "Hyundai",
  model: "Creta",
  year: 2026,
  color: "Black",
  chassis_number: "KMHXX123456789012",
  engine_number: "G4FXX123456",
  status: "READY_STOCK" as const,
  updated_at: "2026-07-20T10:30:00+07:00",
};

describe("upsertVehicle", () => {
  it("should create a new vehicle", async () => {
    const result = await upsertVehicle(validInput);

    expect(result.vehicle.externalId).toBe("UNIT-001");
    expect(result.vehicle.status).toBe("READY_STOCK");
    expect(result.created).toBe(true);
    expect(result.statusChanged).toBe(false); // creation is not a status change
  });

  it("should update an existing vehicle idempotently", async () => {
    await upsertVehicle(validInput);

    const result = await upsertVehicle({
      ...validInput,
      status: "BOOKED",
    });

    expect(result.vehicle.status).toBe("BOOKED");
    expect(result.created).toBe(false);
    expect(result.statusChanged).toBe(true);
  });

  it("should detect no status change on identical data", async () => {
    await upsertVehicle(validInput);

    const result = await upsertVehicle(validInput);

    expect(result.created).toBe(false);
    expect(result.statusChanged).toBe(false);
  });

  it("should throw ConflictError for duplicate chassis_number", async () => {
    await upsertVehicle(validInput);

    await expect(
      upsertVehicle({ ...validInput, external_id: "UNIT-002" })
    ).rejects.toThrow(ConflictError);
  });
});

describe("listVehicles", () => {
  it("should return paginated vehicles", async () => {
    await upsertVehicle(validInput);

    const result = await listVehicles({ page: 1, limit: 20 });

    expect(result.vehicles.length).toBe(1);
    expect(result.pagination.total_count).toBe(1);
    expect(result.pagination.current_page).toBe(1);
    expect(result.pagination.total_pages).toBe(1);
  });

  it("should filter by status", async () => {
    await upsertVehicle(validInput); // READY_STOCK

    const result = await listVehicles({ status: "READY_STOCK" });
    expect(result.vehicles.length).toBe(1);

    const empty = await listVehicles({ status: "DELIVERED" });
    expect(empty.vehicles.length).toBe(0);
  });

  it("should exclude engine_number from list results", async () => {
    await upsertVehicle(validInput);

    const result = await listVehicles({});
    const vehicle = result.vehicles[0];

    expect(vehicle).not.toHaveProperty("engineNumber");
    expect(vehicle).not.toHaveProperty("engine_number");
    expect(vehicle).not.toHaveProperty("chassisNumber");
    expect(vehicle).not.toHaveProperty("chassis_number");
  });
});

describe("getVehicleByExternalId", () => {
  it("should return full vehicle detail with status history", async () => {
    await upsertVehicle(validInput);

    const vehicle = await getVehicleByExternalId("UNIT-001");

    expect(vehicle.external_id).toBe("UNIT-001");
    expect(vehicle.engine_number).toBe("G4FXX123456");
    expect(vehicle.chassis_number).toBe("KMHXX123456789012");
    expect(vehicle.status_history.length).toBe(1);
    expect(vehicle.status_history[0].status).toBe("READY_STOCK");
  });

  it("should throw NotFoundError for non-existent vehicle", async () => {
    await expect(
      getVehicleByExternalId("NONEXISTENT")
    ).rejects.toThrow(NotFoundError);
  });
});
