---
trigger: always_on
---

# Global

### 1. เพื่อให้ implementation สอดคล้องกับระบบเดิม และไม่สร้าง dependency ผิดทิศทางหรือ technical debt โดยไม่จำเป็น

- ✅ ทำความเข้าใจ Architecture และ Dependency Flow ของ Repo ก่อนแก้หรือสร้างโค้ดเสมอ
- 🚫 ห้ามเริ่มเขียนจาก Feature Request ทันทีโดยยังไม่ตรวจโครงสร้างและ pattern ที่มีอยู่

### 2. เพื่อไม่ให้ไฟล์ผูกกับ directory depth และลดผลกระทบเมื่อย้ายหรือ refactor ไฟล์

- ✅ ใช้ Relative Import ได้เฉพาะ `./` และ `../` หากลึกกว่านั้นให้ใช้ `#/`
- 🚫 ห้ามใช้ Deep Relative Import ที่ขึ้นต้นด้วย `../../` หรือมากกว่า

### 3. เพื่อให้ type-only dependency และ runtime dependency ชัดเจน

- ✅ แยก `import type { ... }` ออกจาก Runtime Import อย่างชัดเจน
- 🚫 ห้ามผสม Type และ Non-Type ใน import statement เดียว

### 4. เพื่อให้ dependency ของไฟล์ explicit และไม่สร้าง namespace ที่ไม่จำเป็น

- ✅ ใช้ Named Import เฉพาะสิ่งที่ใช้งานจริง เช่น `import { useMemo } from "react"`
- 🚫 ห้าม wildcard import เช่น `import * as React from "react"`

### 5. Barrel ซ่อน dependency จริง เพิ่มโอกาส circular dependency และทำให้ trace symbol ยากขึ้น

- ✅ Import จาก Source File โดยตรง
- 🚫 ห้ามสร้างหรือขยาย Barrel ที่มีหน้าที่เพียง re-export symbol จากหลายไฟล์

### 6. เพื่อลด blast radius, regression risk และ scope creep

- ✅ ปฏิบัติตามกฎกับ Code ใหม่และ Code ที่กำลังแก้ โดยรักษา Scope ของงานให้แคบที่สุด
- 🚫 ห้ามไล่ Refactor Existing Violation ที่ไม่เกี่ยวข้องกับงานปัจจุบัน

### 7. เพื่อไม่ให้เกิดหลาย abstraction สำหรับปัญหาเดียวกัน

- ✅ ก่อนสร้าง Hook, Cache, Wrapper, Utility หรือ Abstraction ใหม่ ให้ค้นหาของเดิมใน Repo ก่อน
- 🚫 ห้ามสร้างของซ้ำเพียงเพราะสร้างใหม่เร็วกว่าอ่าน implementation เดิม

### 8. Type Error มักสะท้อน data contract หรือ dependency ที่ผิด การซ่อน error จะย้ายปัญหาไป runtime

- ✅ แก้ Type Error และ Architecture Conflict ที่ต้นเหตุโดยรักษา Type Safety
- 🚫 ห้ามใช้ `any`, unsafe cast, duplicated type หรือ bypass layer เพื่อให้ build ผ่าน

### 9. Architectural Boundary เป็น invariant ของ Repo ไม่ใช่ preference

- ✅ หาก Requirement ดูเหมือนต้องละเมิด Architecture ให้หยุด อธิบาย Conflict และเสนอทางเลือกที่สอดคล้องกับกฎ
- 🚫 ห้าม Bypass Boundary เพื่อความสะดวก ลดจำนวนไฟล์ หรือทำ Feature ให้เสร็จเร็วขึ้น

### 10. เป้าหมายคือทำ Requirement ให้สำเร็จภายใต้ Architecture ไม่ใช่ทำลาย Architecture เพื่อให้ Requirement สำเร็จ

- ✅ ใช้หลัก **"Never bypass an architectural boundary for convenience."** ในทุก implementation
- 🚫 ห้ามเลือกวิธีที่เร็วกว่า หากแลกกับ dependency ผิดทิศทาง, hidden responsibility หรือ coupling ที่สูงขึ้น

### 11. Package Manager & Runtime Invariant

- ✅ บังคับใช้ `bun` เป็น Package Manager และ JavaScript/TypeScript Runtime เพียงหนึ่งเดียวในโปรเจกต์นี้เสมอ (เช่น `bun install`, `bun run <script>`, `bun x <pkg>`, `bun <file>`)
- 🚫 ห้ามใช้ `pnpm`, `npm`, `yarn`, `npx` หรือ `node` ในการติดตั้ง จัดการ dependencies หรือรันสคริปต์โดยเด็ดขาด เพื่อป้องกัน `node_modules` พังและป้องกันความขัดแย้งกับ `bun.lock`
- WHY: โปรเจกต์นี้ผูกพันกับ Bun ecosystem อย่างสมบูรณ์ผ่าน `bun.lock` การใช้ package manager หรือ runtime อื่นจะสร้างความเสียหายต่อโครงสร้าง dependencies และ `node_modules` ทันที

# Shared Schemas

### 1. `shared/schemas/**` คือ Source of Truth กลางของ Data Contract ระหว่าง Server และ Client

- ✅ ก่อนสร้างหรือแก้ DTO, Payload, Response, Params หรือข้อมูลที่ใช้ร่วมกันระหว่าง `server/` และ `client/` ให้ตรวจสอบ `shared/schemas/**` ก่อนเสมอ
- 🚫 ห้ามให้ `server/` และ `client/` นิยาม Type หรือ Shape ของข้อมูลเดียวกันแยกกัน
- WHY: เพื่อให้ทั้งสองฝั่งใช้ความหมายและ Data Contract เดียวกัน ลด schema drift และป้องกันกรณีที่ชื่อเดียวกันแต่มี field หรือ semantics ไม่ตรงกัน

### 2. Shared Contract ต้องเริ่มจาก Zod Schema เสมอ

- ✅ สร้าง Zod Schema ไว้ใน `shared/schemas/**` และ derive Type จาก Schema เช่น `z.infer<typeof CustomerSchema>`
- 🚫 ห้ามสร้าง `interface` หรือ `type` สำหรับ Shared DTO แยกจาก Zod Schema แล้ว maintain ทั้งสองชุดด้วยมือ
- WHY: เพื่อให้ Runtime Validation และ TypeScript Type มาจาก Source of Truth เดียวกัน และไม่เกิดความไม่ตรงกันระหว่าง compile-time กับ runtime

### 3. Server และ Client ต้อง Consume Contract จาก `shared/schemas/**`

- ✅ ให้ `server/`, `server-functions/`, `client/caches/` และ Feature ที่เกี่ยวข้อง import Schema หรือ inferred Type จาก `shared/schemas/**`
- 🚫 ห้าม copy, recreate, extend แบบซ้ำซ้อน หรือสร้าง local DTO ที่มีความหมายเดียวกับ Shared Schema
- WHY: การ reuse Contract เดียวกันทำให้การเปลี่ยน field หรือ validation rule propagate ผ่าน Type System และตรวจพบผลกระทบได้ทันที

### 4. Shared Schema มีไว้สำหรับข้อมูลที่ข้าม Application Boundary

- ✅ เก็บ DTO, Request, Response, Params และข้อมูลที่ต้องมีความหมายร่วมกันระหว่าง Server และ Client ไว้ใน `shared/schemas/**`
- 🚫 ห้ามย้าย Server Internal Model, Database Model หรือ Client-only UI State เข้า `shared/schemas/**` เพียงเพื่อให้ reuse ได้
- WHY: `shared/schemas/**` ต้องเป็น Contract Layer ไม่ใช่ที่รวม Type ของทั้งระบบ การแชร์เฉพาะสิ่งที่ข้าม Boundary ช่วยป้องกัน coupling ระหว่าง implementation ภายในของ Server และ Client
