> vehicle-stock-platform@1.0.0 test
> jest --runInBand

FAIL tests/integration/vehicles.test.ts
  ● POST /api/vehicles › should create a new vehicle and return 200

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● POST /api/vehicles › should create a new vehicle and return 200

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● POST /api/vehicles › should be idempotent — same payload returns 200 on retry

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● POST /api/vehicles › should be idempotent — same payload returns 200 on retry

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● POST /api/vehicles › should update vehicle when external_id + company + branch match

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● POST /api/vehicles › should update vehicle when external_id + company + branch match

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● POST /api/vehicles › should return 409 when chassis_number conflicts with different external_id

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● POST /api/vehicles › should return 409 when chassis_number conflicts with different external_id

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● POST /api/vehicles › should return 400 for missing required fields

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● POST /api/vehicles › should return 400 for missing required fields

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● POST /api/vehicles › should return 400 for invalid status

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● POST /api/vehicles › should return 400 for invalid status

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● POST /api/vehicles › should return 401 when no auth header provided

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● POST /api/vehicles › should return 401 when no auth header provided

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● POST /api/vehicles › should return 401 for missing X-API-Key header

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● POST /api/vehicles › should return 401 for missing X-API-Key header

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● POST /api/vehicles › should return 401 for invalid API key (valid JWT, wrong API key)

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● POST /api/vehicles › should return 401 for invalid API key (valid JWT, wrong API key)

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● POST /api/vehicles › should return 401 for invalid JWT (valid API key, bad JWT)

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● POST /api/vehicles › should return 401 for invalid JWT (valid API key, bad JWT)

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● POST /api/vehicles › should return 403 for branch role accessing admin-only endpoint

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● POST /api/vehicles › should return 403 for branch role accessing admin-only endpoint

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● GET /api/vehicles › should return paginated vehicle list

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● GET /api/vehicles › should return paginated vehicle list

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● GET /api/vehicles › should filter by company_code

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● GET /api/vehicles › should filter by company_code

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● GET /api/vehicles › should return empty array when no matches

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● GET /api/vehicles › should return empty array when no matches

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● GET /api/vehicles › should filter by brand

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● GET /api/vehicles › should filter by brand

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● GET /api/vehicles › should filter by model

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● GET /api/vehicles › should filter by model

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● GET /api/vehicles › should filter by year range

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● GET /api/vehicles › should filter by year range

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● GET /api/vehicles › should search by chassis_number (partial match)

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● GET /api/vehicles › should search by chassis_number (partial match)

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● GET /api/vehicles › should filter by multiple statuses

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● GET /api/vehicles › should filter by multiple statuses

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● GET /api/vehicles › should sort by brand ascending

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● GET /api/vehicles › should sort by brand ascending

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● GET /api/vehicles › should sort by updated_at descending by default

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● GET /api/vehicles › should sort by updated_at descending by default

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● GET /api/vehicles › should respect pagination limit

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● GET /api/vehicles › should respect pagination limit

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● GET /api/vehicles/:external_id › should return vehicle detail with status history

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● GET /api/vehicles/:external_id › should return vehicle detail with status history

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

  ● GET /api/vehicles/:external_id › should return 404 for non-existent vehicle

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:24:3)

  ● GET /api/vehicles/:external_id › should return 404 for non-existent vehicle

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/vehicles.test.ts:28:3)

FAIL tests/integration/simulations.test.ts
  ● POST /api/simulations/duplicate-request › should produce exactly 1 vehicle from 10 parallel identical requests

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/simulations.test.ts:25:3)

  ● POST /api/simulations/duplicate-request › should produce exactly 1 vehicle from 10 parallel identical requests

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/simulations.test.ts:29:3)

  ● POST /api/simulations/duplicate-request › should record the initial status history entry (guarded against duplicates)

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/simulations.test.ts:25:3)

  ● POST /api/simulations/duplicate-request › should record the initial status history entry (guarded against duplicates)

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/simulations.test.ts:29:3)

  ● POST /api/simulations/duplicate-request › should record a second status history entry when status changes on subsequent requests

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/simulations.test.ts:25:3)

  ● POST /api/simulations/duplicate-request › should record a second status history entry when status changes on subsequent requests

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/simulations.test.ts:29:3)

  ● POST /api/simulations/duplicate-request › should NOT add status history when status does not change

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/simulations.test.ts:25:3)

  ● POST /api/simulations/duplicate-request › should NOT add status history when status does not change

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/simulations.test.ts:29:3)

  ● POST /api/simulations/duplicate-request › should log every single request

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/simulations.test.ts:25:3)

  ● POST /api/simulations/duplicate-request › should log every single request

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/simulations.test.ts:29:3)

  ● POST /api/simulations/duplicate-request › should return 401 without auth

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/simulations.test.ts:25:3)

  ● POST /api/simulations/duplicate-request › should return 401 without auth

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/simulations.test.ts:29:3)

  ● POST /api/simulations/duplicate-request › should return 403 for non-admin role

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/simulations.test.ts:25:3)

  ● POST /api/simulations/duplicate-request › should return 403 for non-admin role

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/simulations.test.ts:29:3)

  ● POST /api/simulations/duplicate-request › should return 400 when parallel_count is less than 2

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/simulations.test.ts:25:3)

  ● POST /api/simulations/duplicate-request › should return 400 when parallel_count is less than 2

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/simulations.test.ts:29:3)

FAIL tests/integration/auth-jwt.test.ts
  ● Phase 4 Dual Auth — JWT + API-Key › should accept valid admin JWT + admin API key on admin endpoint

    expect(received).not.toBe(expected) // Object.is equality

    Expected: not 401

      15 |
      16 |     // 200 or 500 (no DB) — but NOT 401 or 403
    > 17 |     expect(res.status).not.toBe(401);
         |                            ^
      18 |     expect(res.status).not.toBe(403);
      19 |   });
      20 |

      at Object.<anonymous> (tests/integration/auth-jwt.test.ts:17:28)

  ● Phase 4 Dual Auth — JWT + API-Key › should accept valid ops JWT + ops API key on dashboard

    expect(received).not.toBe(expected) // Object.is equality

    Expected: not 401

      24 |       .set(authHeaders("ops"));
      25 |
    > 26 |     expect(res.status).not.toBe(401);
         |                            ^
      27 |     expect(res.status).not.toBe(403);
      28 |   });
      29 |

      at Object.<anonymous> (tests/integration/auth-jwt.test.ts:26:28)

  ● Phase 4 Dual Auth — JWT + API-Key › should accept valid branch JWT + branch API key on POST /api/vehicles

    expect(received).not.toBe(expected) // Object.is equality

    Expected: not 401

      46 |       });
      47 |
    > 48 |     expect(res.status).not.toBe(401);
         |                            ^
      49 |     expect(res.status).not.toBe(403);
      50 |   });
      51 |

      at Object.<anonymous> (tests/integration/auth-jwt.test.ts:48:28)

  ● Phase 4 Dual Auth — JWT + API-Key › should return 403 when branch JWT tries ops-only endpoint

    expect(received).toBe(expected) // Object.is equality

    Expected: 403
    Received: 401

      59 |       .set(authHeaders("branch"));
      60 |
    > 61 |     expect(res.status).toBe(403);
         |                        ^
      62 |     expect(res.body.success).toBe(false);
      63 |   });
      64 |

      at Object.<anonymous> (tests/integration/auth-jwt.test.ts:61:24)

  ● Phase 4 Dual Auth — JWT + API-Key › should return 403 when ops JWT tries admin-only endpoint

    expect(received).toBe(expected) // Object.is equality

    Expected: 403
    Received: 401

      68 |       .set(authHeaders("ops"));
      69 |
    > 70 |     expect(res.status).toBe(403);
         |                        ^
      71 |   });
      72 |
      73 |   // ═══════════════════════════════════════════════

      at Object.<anonymous> (tests/integration/auth-jwt.test.ts:70:24)

PASS tests/unit/lib/jwt.test.ts
FAIL tests/integration/validation.test.ts
  ● Input Validation — Stricter Formats › should reject chassis_number shorter than 11 chars

    expect(received).toBe(expected) // Object.is equality

    Expected: 400
    Received: 401

      30 |       .send({ ...validVehicle, chassis_number: "ABC123" });
      31 |
    > 32 |     expect(res.status).toBe(400);
         |                        ^
      33 |     expect(res.body.errors.chassis_number).toBeDefined();
      34 |   });
      35 |

      at Object.<anonymous> (tests/integration/validation.test.ts:32:24)

  ● Input Validation — Stricter Formats › should reject chassis_number longer than 17 chars

    expect(received).toBe(expected) // Object.is equality

    Expected: 400
    Received: 401

      40 |       .send({ ...validVehicle, chassis_number: "ABCDEFGH12345678901" });
      41 |
    > 42 |     expect(res.status).toBe(400);
         |                        ^
      43 |     expect(res.body.errors.chassis_number).toBeDefined();
      44 |   });
      45 |

      at Object.<anonymous> (tests/integration/validation.test.ts:42:24)

  ● Input Validation — Stricter Formats › should reject chassis_number with letter I

    expect(received).toBe(expected) // Object.is equality

    Expected: 400
    Received: 401

      50 |       .send({ ...validVehicle, chassis_number: "KMHIX1234567890" });
      51 |
    > 52 |     expect(res.status).toBe(400);
         |                        ^
      53 |     expect(res.body.errors.chassis_number).toBeDefined();
      54 |   });
      55 |

      at Object.<anonymous> (tests/integration/validation.test.ts:52:24)

  ● Input Validation — Stricter Formats › should reject chassis_number with letter O

    expect(received).toBe(expected) // Object.is equality

    Expected: 400
    Received: 401

      60 |       .send({ ...validVehicle, chassis_number: "KMHOX1234567890" });
      61 |
    > 62 |     expect(res.status).toBe(400);
         |                        ^
      63 |     expect(res.body.errors.chassis_number).toBeDefined();
      64 |   });
      65 |

      at Object.<anonymous> (tests/integration/validation.test.ts:62:24)

  ● Input Validation — Stricter Formats › should reject external_id with special characters

    expect(received).toBe(expected) // Object.is equality

    Expected: 400
    Received: 401

      74 |       .send({ ...validVehicle, external_id: "TEST@#$", chassis_number: "KMHXX12345678901" });
      75 |
    > 76 |     expect(res.status).toBe(400);
         |                        ^
      77 |     expect(res.body.errors.external_id).toBeDefined();
      78 |   });
      79 |

      at Object.<anonymous> (tests/integration/validation.test.ts:76:24)

  ● Input Validation — Stricter Formats › should reject brand with HTML tags (rejected at Zod regex level)

    expect(received).toBe(expected) // Object.is equality

    Expected: 400
    Received: 401

      108 |
      109 |     // HTML angle brackets don't match the brand regex — rejected before sanitization
    > 110 |     expect(res.status).toBe(400);
          |                        ^
      111 |     expect(res.body.errors.brand).toBeDefined();
      112 |   });
      113 |

      at Object.<anonymous> (tests/integration/validation.test.ts:110:24)

  ● Input Validation — Business Rules › should reject non-existent company_code

    expect(received).toBe(expected) // Object.is equality

    Expected: 400
    Received: 401

      138 |       .send({ ...validVehicle, company_code: "NONEXISTENT", chassis_number: "KMHXX12345678901" });
      139 |
    > 140 |     expect(res.status).toBe(400);
          |                        ^
      141 |     expect(res.body.errors.company_code).toBeDefined();
      142 |   });
      143 |

      at Object.<anonymous> (tests/integration/validation.test.ts:140:24)

  ● Input Validation — Business Rules › should reject branch_code that does not belong to company

    expect(received).toBe(expected) // Object.is equality

    Expected: 400
    Received: 401

      158 |       });
      159 |
    > 160 |     expect(res.status).toBe(400);
          |                        ^
      161 |     expect(res.body.errors.branch_code).toBeDefined();
      162 |   });
      163 | });

      at Object.<anonymous> (tests/integration/validation.test.ts:160:24)

FAIL tests/integration/rate-limit.test.ts
  ● Rate Limiting › should return RateLimit-* headers on responses

    expect(received).toContain(expected) // indexOf

    Expected value: 401
    Received array: [200, 500]

      38 |     // May or may not be present depending on rate limiter state
      39 |     // At minimum, the response should be valid
    > 40 |     expect([200, 500]).toContain(res.status);
         |                        ^
      41 |   });
      42 |
      43 |   // ═══════════════════════════════════════════════

      at Object.<anonymous> (tests/integration/rate-limit.test.ts:40:24)

PASS tests/integration/swagger.test.ts
FAIL tests/unit/services/vehicle.service.test.ts
  ● upsertVehicle › should create a new vehicle

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/unit/services/vehicle.service.test.ts:6:3)

  ● upsertVehicle › should create a new vehicle

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/unit/services/vehicle.service.test.ts:10:3)

  ● upsertVehicle › should update an existing vehicle idempotently

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/unit/services/vehicle.service.test.ts:6:3)

  ● upsertVehicle › should update an existing vehicle idempotently

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/unit/services/vehicle.service.test.ts:10:3)

  ● upsertVehicle › should detect no status change on identical data

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/unit/services/vehicle.service.test.ts:6:3)

  ● upsertVehicle › should detect no status change on identical data

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/unit/services/vehicle.service.test.ts:10:3)

  ● upsertVehicle › should throw ConflictError for duplicate chassis_number

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/unit/services/vehicle.service.test.ts:6:3)

  ● upsertVehicle › should throw ConflictError for duplicate chassis_number

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/unit/services/vehicle.service.test.ts:10:3)

  ● listVehicles › should return paginated vehicles

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/unit/services/vehicle.service.test.ts:6:3)

  ● listVehicles › should return paginated vehicles

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/unit/services/vehicle.service.test.ts:10:3)

  ● listVehicles › should filter by status

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/unit/services/vehicle.service.test.ts:6:3)

  ● listVehicles › should filter by status

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/unit/services/vehicle.service.test.ts:10:3)

  ● listVehicles › should exclude engine_number from list results

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/unit/services/vehicle.service.test.ts:6:3)

  ● listVehicles › should exclude engine_number from list results

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/unit/services/vehicle.service.test.ts:10:3)

  ● getVehicleByExternalId › should return full vehicle detail with status history

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/unit/services/vehicle.service.test.ts:6:3)

  ● getVehicleByExternalId › should return full vehicle detail with status history

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/unit/services/vehicle.service.test.ts:10:3)

  ● getVehicleByExternalId › should throw NotFoundError for non-existent vehicle

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/unit/services/vehicle.service.test.ts:6:3)

  ● getVehicleByExternalId › should throw NotFoundError for non-existent vehicle

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/unit/services/vehicle.service.test.ts:10:3)

FAIL tests/integration/integration-logs.test.ts
  ● GET /api/integration-logs › should return paginated integration logs (admin access)

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/integration-logs.test.ts:9:3)

  ● GET /api/integration-logs › should return paginated integration logs (admin access)

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/integration-logs.test.ts:13:3)

  ● GET /api/integration-logs › should filter logs by status

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/integration-logs.test.ts:9:3)

  ● GET /api/integration-logs › should filter logs by status

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/integration-logs.test.ts:13:3)

  ● GET /api/integration-logs › should filter logs by external_id

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/integration-logs.test.ts:9:3)

  ● GET /api/integration-logs › should filter logs by external_id

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/integration-logs.test.ts:13:3)

  ● GET /api/integration-logs › should not expose sensitive data in request_payload_summary

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/integration-logs.test.ts:9:3)

  ● GET /api/integration-logs › should not expose sensitive data in request_payload_summary

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/integration-logs.test.ts:13:3)

PASS tests/unit/lib/sanitize.test.ts
FAIL tests/integration/dashboard.test.ts
  ● GET /api/dashboard/summary › should return dashboard summary with all expected metrics

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/dashboard.test.ts:10:3)

  ● GET /api/dashboard/summary › should return dashboard summary with all expected metrics

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/dashboard.test.ts:14:3)

  ● GET /api/dashboard/summary › should return 401 without authentication

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/dashboard.test.ts:10:3)

  ● GET /api/dashboard/summary › should return 401 without authentication

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/dashboard.test.ts:14:3)

  ● GET /api/dashboard/summary › should reflect vehicle data after ingestion

    PrismaClientKnownRequestError: 
    Invalid `prisma.company.upsert()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:19:24

      16  * Seed test data: companies and branches.
      17  */
      18 export async function seedTestData(): Promise<void> {
    → 19   await prisma.company.upsert(
    The table `public.company` does not exist in the current database.

      17 |  */
      18 | export async function seedTestData(): Promise<void> {
    > 19 |   await prisma.company.upsert({
         |   ^
      20 |     where: { code: "PT-AKA" },
      21 |     update: {},
      22 |     create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async seedTestData (tests/helpers/db.ts:19:3)
      at async Object.<anonymous> (tests/integration/dashboard.test.ts:10:3)

  ● GET /api/dashboard/summary › should reflect vehicle data after ingestion

    PrismaClientKnownRequestError: 
    Invalid `prisma.integrationLog.deleteMany()` invocation in
    /home/runner/work/arista-vsi/arista-vsi/tests/helpers/db.ts:10:31

       7  * Deletes in correct order to respect foreign key constraints.
       8  */
       9 export async function cleanDatabase(): Promise<void> {
    → 10   await prisma.integrationLog.deleteMany(
    The table `public.integration_log` does not exist in the current database.

       8 |  */
       9 | export async function cleanDatabase(): Promise<void> {
    > 10 |   await prisma.integrationLog.deleteMany();
         |   ^
      11 |   await prisma.vehicleStatusHistory.deleteMany();
      12 |   await prisma.vehicle.deleteMany();
      13 | }

      at $n.handleRequestError (node_modules/@prisma/client/runtime/library.js:121:7315)
      at $n.handleAndLogRequestError (node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (node_modules/@prisma/client/runtime/library.js:121:6307)
      at async l (node_modules/@prisma/client/runtime/library.js:130:9633)
      at async cleanDatabase (tests/helpers/db.ts:10:3)
      at async Object.<anonymous> (tests/integration/dashboard.test.ts:14:3)

PASS tests/integration/health.test.ts

Test Suites: 8 failed, 4 passed, 12 total
Tests:       62 failed, 62 passed, 124 total
Snapshots:   0 total
Time:        6.769 s
Ran all test suites.
Error: Process completed with exit code 1.