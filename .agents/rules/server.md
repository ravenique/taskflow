---
trigger: always_on
---

# Server

ข้อกำหนดสำหรับงาน Backend ทั้งหมด ภายใต้สถาปัตยกรรม Domain-Driven Design (DDD), Clean Architecture และ High-Performance Engineering

---

## Architectural Boundaries & Dependency Direction

### 1. เพื่อรักษา Dependency Rule (Inward-only) ตามหลัก Clean Architecture

- ✅ กำหนดให้ทิศทางการพึ่งพาไหลเข้าสู่ศูนย์กลางเสมอ: `Infrastructure → Application → Domain`
- 🚫 ห้าม `server/domain/` นำเข้า (import) สิ่งใดจาก `server/application/`, `server/infrastructure/`, `server/composition/`, `server-functions/` หรือ library ภายนอก ยกเว้น `shared/schemas/`
- WHY: Domain คือแกนกลางของระบบที่ต้องบริสุทธิ์ (Pure Domain) ไม่ผูกติดกับ Framework, Database ORM หรือเทคโนโลยีภายนอก เพื่อให้ทดสอบง่ายและคงทนต่อการเปลี่ยนแปลง

### 2. เพื่อรักษา Server Boundary และไม่ให้รายละเอียดภายใน `server/` รั่วไปยัง layer อื่น

- ✅ ใช้ `server-functions/` เป็น Gateway เดียวสำหรับเข้าถึง `server/` จากภายนอก
- 🚫 ห้าม `routes/`, `client/`, `hooks/`, `components/` หรือ `caches/` เรียกโค้ดใน `server/` โดยตรง
- WHY: ป้องกัน Coupling ข้ามฝั่ง และรักษาขอบเขต Client/Server ให้สื่อสารผ่าน RPC Gateway ที่มี Middleware ควบคุมอย่างเคร่งครัด

### 3. เพื่อให้ Data Access และ Server-State มี Ownership ชัดเจน ไม่กระจาย Request Logic ทั่ว UI

- ✅ อนุญาตให้ Route `beforeLoad`, `loader` และ `client/caches/**` เรียก `server-functions/`
- 🚫 ห้าม Screen, Component หรือ Feature Hook เรียก `server-functions/` โดยตรง
- WHY: รวมศูนย์การจัดการ Network I/O, Cache Invalidation และ Loading/Error State ไว้ที่ Route และ TanStack Query Caches เท่านั้น

---

## Domain Layer: Tactical DDD & Invariants

### 4. เพื่อปกป้อง Business Invariants และห้าม Anemic Domain Model

- ✅ ห่อหุ้ม State ภายใน Entity/Aggregate Root ด้วย `private` หรือ `protected` properties พร้อมเปิดอ่านผ่าน readonly getter และเปลี่ยนแปลงสถานะผ่าน Domain Methods เท่านั้น เช่น `user.updateProfile(name, avatarUrl)`
- 🚫 ห้ามสร้าง Public Setters หรือเปิดให้ภายนอกแก้ไข properties ของ Entity โดยตรง
- 🚫 ห้ามสร้าง Anemic Model ที่มีเฉพาะ Data Fields แล้วนำ Business Rules ไปกระจายไว้ใน Service/Use Case
- WHY: Aggregate Root มีหน้าที่เป็นผู้พิทักษ์ความถูกต้องของข้อมูล (Consistency Boundary) กฎทางธุรกิจและ Invariants ต้องถูกตรวจสอบภายใน Entity เสมอ

### 5. เพื่อแยกชัดเจนระหว่างการสร้าง Aggregate ใหม่ กับการคืนสภาพจาก Database (Reconstitution)

- ✅ สร้าง Aggregate Root ตัวใหม่จากศูนย์ผ่าน Static Factory Method เช่น `Entity.create(...)` เพื่อกำหนดค่าเริ่มต้น (UUID, Default Status, Timestamps) และตรวจสอบ Invariants
- ✅ คืนสภาพ Entity ที่มีอยู่แล้วจาก Database ผ่าน `constructor` หรือ static `reconstitute(...)` ภายใน Repository เท่านั้น
- 🚫 ห้าม Use Case หรือเลเยอร์อื่นเรียก `new Entity(...)` แล้วประกอบ field ภายในเองโดยตรง
- WHY: การสร้าง Entity ใหม่มี Invariants และ Lifecycle ต่างจากการโหลดข้อมูลประวัติที่มีอยู่แล้วจาก Database การใช้ Factory Method ช่วยให้ Lifecycle ของ Entity ชัดเจนและปลอดภัย

### 6. เพื่อรักษาความบริสุทธิ์ของ Repository Interface ใน Domain

- ✅ นิยาม Interface ของ Repository ไว้ใน `server/domain/<module>/<entity>.interface.ts` โดยเมธอดต้องรับและคืนค่าเฉพาะ Domain Entity หรือ Primitives เท่านั้น เช่น `findById(id: string): Promise<User | null>`
- 🚫 ห้าม Repository Interface อ้างอิงถึง Database Tables, Drizzle Row Models, SQL Types หรือ DTO
- WHY: Domain ต้องเป็นผู้ออกแบบ Contract ว่าต้องการข้อมูลอะไร ส่วน Infrastructure มีหน้าที่ทำตามสัญญา (Dependency Inversion Principle)

### 7. เพื่อจัดการข้อผิดพลาดทางธุรกิจอย่างมีแบบแผนและไม่ผูกติดกับ Transport Protocol

- ✅ สร้าง Custom Domain Errors โดยสืบทอดจาก `DomainError` ใน `server/domain/common/errors.ts` เช่น `UserNotFoundError` หรือ `InvalidOperationError`
- 🚫 ห้ามผูก Domain Error เข้ากับ HTTP Status Codes (เช่น `404`, `500`), RPC Protocol หรือ UI Presentation
- WHY: ข้อผิดพลาดใน Domain สะท้อนถึงการละเมิดกฎทางธุรกิจ ไม่ใช่สถานะของโปรโตคอลเครือข่าย

---

## Application Layer: Use Cases & Orchestration

### 8. เพื่อรักษา Single Responsibility Principle และแยก Workflow ตาม Clean Architecture

- ✅ ออกแบบ Use Case ให้เป็น **1 ไฟล์ต่อ 1 Use Case** เช่น `<action>-<entity>.use-case.ts` โดยมีคลาสเดี่ยวและเมธอด `execute(...)` พร้อม Explicit Return Type
- 🚫 ห้ามรวม CRUD ทั้งหมดเป็น Monolithic Service หรือคลาสพหูพจน์ เช่น `<domain>s.use-cases.ts` หรือ `<Domain>UseCases`
- WHY: แยก Use Case อย่างอิสระช่วยให้โค้ดอ่านง่าย ทดสอบสะดวก ไม่เกิด merge conflict และตัดผลกระทบข้ามฟีเจอร์เมื่อมีการแก้ไข

### 9. เพื่อให้ Input Contract ของแต่ละ Use Case ชัดเจนและปลอดภัย

- ✅ นิยาม Interface หรือ Type สำหรับ Input DTO ประจำแต่ละ Use Case เช่น `Create<Domain>Input`, `Update<Domain>Input`
- 🚫 ห้ามส่ง parameters เป็น positional arguments กระจัดกระจายหลายตัวเข้าไปใน Use Case
- WHY: Input Object รองรับการขยายตัวในอนาคตได้โดยไม่ทำลาย signature เดิม และช่วยให้การส่งข้อมูลเข้ามีความหมายชัดเจน

### 10. เพื่อจำกัดหน้าที่ของ Use Case ให้เป็นเพียง Orchestrator

- ✅ ให้ Use Case ทำหน้าที่ควบคุม Workflow เท่านั้น: ดึง Entity ผ่าน Repository → สั่ง Entity รัน Domain Method → บันทึก Entity ผ่าน Repository → แปลง Entity เป็น DTO ผ่าน Mapper
- 🚫 ห้ามใส่ Business Logic, กฎการคำนวณ หรือ Invariant Validation ภายใน Use Case
- 🚫 ห้ามเขียน Query SQL, Drizzle ORM หรือเรียก Database โดยตรงใน Use Case
- WHY: ป้องกันไม่ให้ Business Logic รั่วไหลออกจาก Domain และรักษาให้ Use Case เป็นเพียงผู้ประสานงานระหว่าง Domain กับ Infrastructure

### 11. เพื่อรักษามาตรฐานของ Data Mapper และป้องกัน Domain หลุดออกนอกเลเยอร์

- ✅ จัดโครงสร้าง Mapper ใน `server/application/mappers/` เป็น Class พร้อม Static Method เช่น `UserMapper.toDto(user)` และนำเข้าผ่าน path alias `#/server/application/mappers/...`
- 🚫 ห้ามส่ง Domain Entity ข้าม Application Layer ออกไปยัง Gateway หรือ Presentation โดยตรง
- 🚫 ห้ามใช้ Standalone Function หรือ Relative Import ข้ามเลเยอร์สำหรับ Mapper
- WHY: DTO ทำหน้าที่เป็น Anti-Corruption Layer ป้องกันไม่ให้โครงสร้างภายในของ Domain ผูกติดกับ API Contract ภายนอก

### 12. เพื่อรักษา Consistency Boundary และ Atomic Multi-Entity Operations

- ✅ เมื่อ Use Case จำเป็นต้องบันทึกข้อมูลข้ามหลาย Aggregate หรือหลายตารางพร้อมกัน ต้องควบคุมผ่าน `IUnitOfWork.withTransaction(...)` จาก Domain Common Abstraction
- 🚫 ห้ามเปิด Transaction ตรงๆ ผ่าน Database Driver หรือ Drizzle Client ภายใน Use Case
- WHY: ควบคุม ACID Transaction ภายใต้ Abstraction ทำให้ Application Layer ยังคงเป็นอิสระจากเทคโนโลยี Database

---

## Infrastructure Layer: Persistence & High Performance (Drizzle ORM)

### 13. เพื่อรักษาการแปลงสภาพข้อมูลระหว่าง Database Schema กับ Domain Entity

- ✅ Implement Repository Interface จาก Domain ไว้ใน `server/infrastructure/<module>/` พร้อมเมธอดภายในแบบ `private toEntity(row): Entity` เพื่อแปลง Drizzle Row กลับเป็น Domain Entity
- 🚫 ห้ามให้ Persistence Details (เช่น table columns, drizzle helpers, database jsonb shapes) รั่วไหลออกไปภายนอก Repository Class
- WHY: แยก Database Schema (Data Model) ออกจาก Domain Entity (Behavioral Model) เพื่อให้แต่ละฝั่งปรับโครงสร้างได้อย่างอิสระ

### 14. เพื่อลด Database Round-trips และเพิ่มประสิทธิภาพสูงสุดในการเข้าถึงข้อมูล

- ✅ ออกแบบ Repository และ Use Case ให้ทำ Query เท่าที่จำเป็น โดยใช้ความสามารถของ Database ให้จบใน Single Round-trip:
  - ใช้ Upsert (`onConflictDoUpdate`) แทนการ Query ตรวจสอบก่อน Insert
  - ใช้ WHERE conditions ร่วมกับ `returning()` ในคำสั่ง `UPDATE` / `DELETE` จบในคำสั่งเดียว
  - ป้องกัน N+1 Queries โดยใช้ Batch Query, Joins หรือ Relational Queries อย่างเหมาะสม
- 🚫 ห้ามทำ Double Query โดยไม่จำเป็น เช่น การ `SELECT` ดึงข้อมูลทั้งแถวมาตรวจก่อนสั่ง `DELETE` ทั้งที่คำสั่งลบมีเงื่อนไข WHERE version หรือ id คอยดักอยู่แล้ว
- WHY: Network Round-trip ไปยัง Database คือหนึ่งในคอขวดหลักของประสิทธิภาพ การลดจำนวน Round-trip ช่วยลด Latency และ Connection Load อย่างมหาศาล

### 15. เพื่อรองรับ Read-heavy Operations ได้อย่างมีประสิทธิภาพ (CQRS Query Projections)

- ✅ สำหรับ Use Case ที่เป็นการอ่านข้อมูลอย่างเดียว (Read-only / Search / Complex Pagination) ที่ไม่มีการแก้ไขสถานะ อนุญาตให้ Query และ Map ข้อมูลออกเป็น DTO โดยตรง (Direct Projection) โดยไม่ต้อง Reconstitute ทั้ง Aggregate Root
- 🚫 ห้ามโหลด Aggregate Root เต็มรูปแบบเข้ามาในหน่วยความจำเพียงเพื่อหยิบ Field เล็กน้อยไปแสดงผลในตารางหรือรายการสรุป
- WHY: การ Reconstitute Aggregate Root ทั้งก้อนมี Overhead สูงสำหรับชุดข้อมูลขนาดใหญ่ การทำ Read Model Direct Projection ช่วยประหยัด CPU, Memory และ Query Time

### 16. เพื่อไม่ให้ Transaction Details ของ Database รั่วไหลเข้า Domain ผ่าน Repository Signature

- ✅ ให้ Infrastructure ควบคุม Transaction Context ผ่าน `AsyncLocalStorage` ภายใน `server/infrastructure/drizzle/` เพื่อให้ Repository สลับใช้ `tx` เมื่ออยู่ใน Transaction และ `db` เมื่ออยู่นอก Transaction ได้โดยอัตโนมัติ
- 🚫 ห้ามส่ง Transaction Object (`tx`, `DrizzleTx`, `Client`) ผ่านพารามิเตอร์ของ Repository Method ใน Domain Interface (เช่น `save(entity, tx)`) โดยเด็ดขาด
- WHY: เพื่อรักษาความบริสุทธิ์ของ Domain Repository Interface ตาม Dependency Inversion Principle ไม่ให้รายละเอียดการเชื่อมต่อหรือการจัดการ Transaction ของ Database หลุดเข้ามาปนเปื้อนในสัญญาของ Domain

---

## Composition Layer: Pure Dependency Injection

### 17. เพื่อรวมศูนย์การประกอบ Object Graph แบบโปร่งใสและปราศจาก Magic Framework

- ✅ จัดการ Dependency Injection ผ่าน Composition Roots ใน `server/composition/`:
  - สร้าง Repository และ Unit of Work Singletons ใน `server/composition/repositories.ts`
  - ประกอบ Use Cases ประจำแต่ละโมดูลใน `server/composition/<module>.container.ts`
  - รวม Re-export Use Cases ที่พร้อมใช้งานใน `server/composition/container.ts`
- 🚫 ห้าม Use Case หรือ Service สั่ง `new ConcreteRepository()` หรือเข้าถึง `db` ด้วยตัวเองภายในคลาส
- 🚫 ห้ามใช้ Heavy DI Framework หรือ Reflection ที่เพิ่มความซับซ้อนโดยไม่จำเป็น
- WHY: Pure Manual DI ทำให้ Dependency Graph ตรวจสอบได้ง่ายผ่าน Type System รันเร็ว และสามารถแทนที่ Repository ด้วย Mock/Stub ใน Unit Test ได้ทันที

---

## Server Functions & RPC Gateway

### 18. เพื่อรักษาหน้าที่ของ Gateway ให้เป็น Thin Driving Adapter

- ✅ ออกแบบ `server-functions/` ให้ทำหน้าที่เป็นทางผ่านบางๆ (Thin Adapter):
  1. ตรวจสอบสิทธิ์ผ่าน Middleware เช่น `requireAuth`
  2. ตรวจสอบความถูกต้องของ Input Payload ด้วย Shared Zod Schema จาก `shared/schemas/`
  3. เรียก `execute()` ของ Use Case ที่ได้รับ Inject จาก Composition Container
  4. คืนค่าผลลัพธ์เป็น DTO
- 🚫 ห้ามเขียน Business Logic, Data Transformation ที่ซับซ้อน หรือคำสั่ง Database ใดๆ ภายใน Server Functions
- WHY: Server Functions คือ Driving Adapter (ทางเข้าของ RPC) เท่านั้น การไม่ใส่ Business Logic ช่วยให้เปลี่ยนวิธีเรียก (เช่น เพิ่ม REST/GraphQL/CLI) ในอนาคตได้โดยไม่ต้องแตะโค้ดธุรกิจ

---

## Configuration & Fail-Fast Reliability

### 19. เพื่อรับประกันความถูกต้องของการตั้งค่าระบบแบบ Fail-fast

- ✅ ตรวจสอบ Environment Variables ทั้งหมดของเซิร์ฟเวอร์ผ่าน Zod Schema ใน `server/config/env.ts` ตอนเริ่มต้นระบบ พร้อม Fail-fast หากค่าที่จำเป็น (เช่น `DATABASE_URL` ใน production) ไม่ครบถ้วน
- 🚫 ห้ามเข้าถึง `process.env` โดยตรงแบบกระจายตัวในเลเยอร์ Domain, Application หรือ Infrastructure
- WHY: การดักจับ Config Error ตั้งแต่จุดเริ่มต้นช่วยป้องกันไม่ให้ระบบล้มเหลวแบบไม่ทราบสาเหตุระหว่างประมวลผลคำขอจริง
