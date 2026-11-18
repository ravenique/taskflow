---
trigger: always_on
---

# Client

ข้อกำหนดสำหรับงาน Frontend ทั้งหมด ภายใน `src/client/`

### 1. Route ควรรู้เพียงว่า URL ใช้ Screen ใด ส่วนรายละเอียด UI ให้ Feature เป็นเจ้าของ

- ✅ ให้ Route UI render ผ่าน `features/**/screens/*.tsx` หรือ `features/**/screen.tsx`
- 🚫 ห้าม Route ประกอบ UI จาก `features/**/components/*` โดยตรง
- WHY: เพื่อแยก Routing Concerns (URL, route params, loader, metadata) ออกจาก UI Structure และรักษาขอบเขตความเป็นเจ้าของ (Feature Ownership) ให้ Feature ควบคุมหน้าตาและการจัดวางด้วยตนเอง

### 2. Screen คือ Composition Root ในการประกอบ UI ประจำหน้านั้น

- ✅ ให้ `features/**/screens/*.tsx` หรือ `features/**/screen.tsx` ทำหน้าที่เป็น Composition Root ประกอบโครงสร้าง Layout และเรียก Feature Components จาก `features/**/components/*.tsx` แบบ Zero Props
- 🚫 ห้าม Route ประกอบ UI จาก Component ย่อยโดยตรง และห้ามส่ง State, Data, Behavior, Callback, Configuration, `children`, `className` หรือค่าใด ๆ ผ่าน props เข้า `features/**/components/*`
- WHY: ยึดหลัก Zero Props Architecture ตัดปัญหา Prop Drilling ขจัดความเปราะบางของ Component Interfaces และทำให้แต่ละ Component เป็นอิสระในการจัดวางหรือสลับตำแหน่งโดยไม่กระทบ Data Contract

### 3. Screen และ Component เป็น Pure Presentation ห้ามมี Logic โดยให้ Hook เป็นเจ้าของ Logic เท่านั้น

- ✅ ให้ `features/**/screens/*.tsx` และ `features/**/components/*.tsx` ทำหน้าที่เฉพาะ Declarative UI และ Layout เท่านั้น
- ✅ ให้ State, Data Fetching, Data Transformation/Calculation, Event Handling และ UI Interaction ทั้งหมด ถูก encapsulate อยู่ใน `features/**/hooks/*.ts`
- 🚫 ห้ามเขียน Business Logic, Data Calculation/Filter, หรือจัดการ State ภายใน Screen และ Component
- 🚫 ห้ามประกาศ Props, รับ parameter, destructure props หรือใช้ React props mechanism ใด ๆ ภายใน Feature Components
- WHY: แยก Presentation ออกจาก Interaction & Logic โดยเด็ดขาด ทำให้ UI อ่านง่าย ทดสอบ State และ Logic ได้สะดวกผ่าน Unit Tests โดยไม่ต้อง Mount DOM และป้องกัน Logic ปะปนกับ Markup

### 4. เพื่อป้องกันการเปลี่ยนรูป Prop Drilling โดยไม่ได้แก้ ownership จริง การซ่อน props หลัง inferred type ยังคงเป็น props architecture เหมือนเดิม

- ✅ ออกแบบ Hook API ให้ Component เรียกเฉพาะ scope ที่ตนรับผิดชอบ เช่น `useCustomersCard()`, `useCustomersActions()`
- 🚫 ห้ามลักไก่ย้าย Props ไปไว้ใน Hook แล้วนำกลับมาสร้าง Props Type เช่น `ReturnType<typeof useX>`, `typeof hook`, `Pick<ReturnType<...>>`, `ComponentProps`, `Parameters` หรือ pattern เทียบเท่า
- WHY: การซ่อน Props Type ไว้หลัง Hook Inferred Type เป็นเพียงการเปลี่ยนรูปแต่ยังคงมี Coupling และการผูกติดข้อมูลแบบ Prop Drilling อยู่ การให้ Component เรียก Hook ที่เจาะจง scope ตัวเองโดยตรงช่วยรักษา Local Ownership ที่แท้จริง

### 5. เพื่อไม่ให้ Hook กลายเป็น "กระสอบ Props" และรักษา local ownership ของแต่ละ Component

- ✅ ให้ Component เรียก Hook ที่เหมาะสมด้วยตนเอง และใช้ค่าจาก Hook ภายใน Component นั้นโดยตรง
- 🚫 ห้ามเอา Hook result จาก Parent แล้ว spread หรือส่งต่อให้ Child เช่น `<Child {...useX()} />`, `<Child {...state} />` หรือ `<Child data={hook.data} />`
- WHY: ป้องกันปัญหา Parent กลายเป็น God Component ที่ต้องแบกรับ State แทนลูกๆ และลด Re-render Cascade ที่ไม่จำเป็นเมื่อ State ใน Child ตัวใดตัวหนึ่งเปลี่ยนแปลง

### 6. Hook ควรมี responsibility และเหตุผลในการเปลี่ยนแปลงที่ชัดเจน เพื่อให้อ่าน ทดสอบ และแก้ไขง่าย

- ✅ ให้ 1 Hook รับผิดชอบ 1 cohesive scope of work เช่น form, dialog, pagination หรือ mutation
- 🚫 ห้ามทำ God Hook ที่รวม query, mutation, form, dialog, navigation และ UI state ไว้ด้วยกัน
- WHY: ยึดหลัก Single Responsibility Principle (SRP) ทำให้แต่ละ Hook มีขนาดกะทัดรัด แยกการ Re-render ชัดเจน ทดสอบง่าย และแก้ไขส่วนใดส่วนหนึ่งได้โดยไม่เสี่ยงทำลายส่วนอื่น

### 7. เป้าหมายคือ cohesion ไม่ใช่จำนวนบรรทัดหรือจำนวน Hook

- ✅ แยก Hook ตาม responsibility ที่มีความหมาย
- 🚫 ห้ามแก้ God Hook ด้วยการแตกทุก state หรือ callback เป็น Micro Hook โดยไม่มี semantic boundary
- WHY: เพื่อป้องกันปัญหา Fragmentation ที่ทำให้การติดตาม State Flow ซับซ้อนเกินจำเป็น โค้ดที่ทำงานร่วมกันและเปลี่ยนแปลงพร้อมกันในบริบทเดียวกันควรอยู่ด้วยกัน (High Cohesion)

### 8. Success/Error ของ mutation เป็นส่วนหนึ่งของ server-state lifecycle และควรมี owner เดียว

- ✅ ให้ Server-State Toast และ Mutation Feedback อยู่ใน `client/caches/**`
- 🚫 ห้ามใส่ Toast ของ create/update/delete หรือ server mutation กระจายใน Screen และ Component
- WHY: รวมศูนย์การจัดการ Feedback ของ Server State ไว้ที่เดียว เพื่อความสม่ำเสมอของ UX และป้องกันการยิง Toast ซ้ำซ้อนเมื่อมีหลาย Component เรียกใช้ Mutation เดียวกัน

### 9. Cache มีหน้าที่ดูแล server-state ไม่ควรกลายเป็นที่รวม UI behavior ทุกประเภท

- ✅ Local UI Feedback ที่ไม่เกี่ยวกับ server-state ให้จัดการใน Feature Hook ที่รับผิดชอบ behavior นั้น
- 🚫 ห้ามบังคับ interaction เช่น copy-to-clipboard ให้ผ่าน caches
- WHY: แยกขอบเขตหน้าที่อย่างชัดเจน Caches มีหน้าที่จัดการ Network I/O และ Server Cache Invalidation ส่วน Client-only Interaction ต้องจบในระดับ Feature เพื่อไม่ให้ Cache Layer บวมและผิดวัตถุประสงค์

### 10. Design ที่ User ให้มาคือ requirement ไม่ใช่ suggestion

- ✅ เมื่อ User มี Design, Mockup, Screenshot หรือ UI Spec ให้ถือเป็น Source of Truth สูงสุด
- 🚫 ห้ามแก้ Layout, Spacing, Typography, Component หรือ Interaction ของ Design โดยพลการ
- WHY: งานออกแบบคือสิ่งที่ผ่านการคิดและตัดสินใจทางธุรกิจ/ผู้ใช้มาแล้ว การดัดแปลงตามความสะดวกของ Developer/Agent จะทำลาย Intent เดิมและสร้างความขัดแย้งกับ Requirement ของผู้ใช้

### 11. User ต้องเป็นผู้ตัดสิน trade-off ด้าน Product/UI

- ✅ หากจำเป็นต้องเปลี่ยน Design ของ User ต้องขออนุญาตก่อน พร้อมระบุว่าจะเปลี่ยนอะไร ที่ไหน และเพราะอะไร
- 🚫 ห้ามเปลี่ยน Design ด้วยเหตุผลด้าน preference, convenience หรือความเห็นส่วนตัวของ Agent
- WHY: การตัดสินใจปรับเปลี่ยนดีไซน์หรือพฤติกรรม UI เป็นความรับผิดชอบของ Product Owner / User เท่านั้น การขออนุญาตอย่างโปร่งใสช่วยรักษา Trust และได้ผลลัพธ์ตรงความต้องการจริง

### 12. เพื่อรักษา Design Language ให้สม่ำเสมอทั้งระบบ

- ✅ เมื่อไม่มี Design จาก User ให้อิง Existing Repository Design และ `.agents/skills/shadcn/rules/**/*.md`
- 🚫 ห้ามออกแบบจาก preference ส่วนตัว หรือ pattern ภายนอกที่ไม่สอดคล้องกับ Repo
- WHY: เพื่อให้ทุกหน้าจอในแอปพลิเคชันมีความกลมกลืนเป็นอันหนึ่งอันเดียวกัน (Visual Consistency) และใช้ประโยชน์จาก Patterns หรือ Tokens ที่ถูกวางรากฐานไว้แล้ว

### 13. เพื่อให้แหล่งอ้างอิงด้าน Design มี precedence ที่ชัดเจน

- ✅ ใช้ลำดับ `User Design → Existing Repository Design → shadcn rules`
- 🚫 ห้ามคิดหรือเปลี่ยน Design เองโดยไม่ได้รับความเห็นชอบจาก User
- WHY: ลำดับความสำคัญที่ชัดเจนช่วยขจัดความคลุมเครือเมื่อเกิดความขัดแย้งทาง Design และรับประกันว่า Requirement ของ User จะได้รับการเคารพสูงสุดเสมอ

### 14. เพื่อแยก application-specific behavior ออกจาก shared primitive และลดผลกระทบต่อ consumer อื่น

- ✅ ถือ `client/shared/shadcn/**` เป็น Read-Only Primitive Layer และสร้าง Wrapper ใน `client/shared/components/app-router.tsx` หรือ `client/shared/components/**` ตาม responsibility
- 🚫 ห้ามแก้หรือ customize `client/shared/shadcn/**` โดยตรง
- WHY: shadcn primitives เป็น Unstyled/Headless Primitives พื้นฐานระดับระบบ การไม่แก้ไขโค้ดโดยตรงช่วยให้อัปเกรดง่าย ไม่เกิด Breaking Change กับ Feature อื่น และแยก Application Logic ออกเป็น Wrapper ชั้นนอกอย่างสะอาด

### 15. เพื่อให้ visual boundary มาจาก Design System เดียวกัน

- ✅ ใช้ Border, Ring และ Shadow ผ่าน Primitive Component ที่ติดตัวมากับ shadcn แล้วเท่านั้น เช่น ใช้ `<Card>` สำหรับกรอบคอนเทนเนอร์, ใช้ `<Separator />` สำหรับเส้นคั่นแบ่งส่วน หรือใช้ Component Variant สำเร็จรูป (เช่น `<Button variant="outline">`)
- 🚫 ห้ามเติม `border-*` หรือ `ring-*` ใน `className` โดยพลการ (เช่น `<div className="border-*">`, `<div className="border border-border">` หรือ custom ring/border อื่นๆ)
- เป็นเหี้ยอะไรกับ Border บอกแล้วไม่ใช่หรอว่าอย่าใส่ขอบเอง
- WHY: เพื่อรักษาความสม่ำเสมอของ Design System ทั้งระบบ visual boundary ต้องถูกควบคุมผ่าน Semantic Tokens (`--border`, `--ring`, `--input`) และรัศมีความโค้ง (`--radius`) ของ Primitive Component เพื่อป้องกันความคลาดเคลื่อนของสี รัศมี และการแสดงผลที่ผิดเพี้ยนเมื่อสลับ Theme (Light/Dark Mode)

### 16. แยก Logic ของ Authentication ออกจาก Presentation โดยรองรับทั้ง Dedicated Routes และ Modal Auth

- ✅ รองรับทั้งรูปแบบ Dedicated Auth Routes (เช่น `/sign-in`, `/sign-up` ภายใต้ `_public` คู่กับ Route Guard `beforeLoad` ใน `_auth`) และรูปแบบ Modal-based Auth / Polite Auth Gate ตามที่โปรเจกต์กำหนด
- 🚫 ห้ามจัดการ Logic การ Sign-in / Sign-up หรือตรวจสอบ Session โดยตรงภายใน Screen และ Component ให้แยก Logic ผ่าน Route `beforeLoad`, Feature Hooks และ TanStack Query Caches เท่านั้น
- WHY: เพื่อให้สถาปัตยกรรม Auth ยืดหยุ่นต่อทั้งผู้ให้บริการอย่าง Better Auth หรือ Clerk และรองรับ UX ทั้งแบบเปลี่ยนหน้าและแบบ Modal โดยยังคงรักษาความเป็น Pure Presentation (Zero Props) ของ UI Components อย่างเคร่งครัด

### 17. ห้ามสร้าง Custom CSS Classes หรือ Custom Design ใน `client/styles/*` โดยพลการ

- ✅ ให้ `client/styles/*` (เช่น `global.css`) ทำหน้าที่เฉพาะ System-level Infrastructure เท่านั้น ได้แก่ Tailwind CSS v4 directives, Theme Design Tokens (CSS Variables ใน `:root` และ `.dark`), Font Imports และ Base HTML Element Resets
- 🚫 ห้าม Agent สร้าง Custom CSS Classes, Utility Classes, Animation Keyframes หรือสร้างไฟล์ CSS ย่อยขึ้นมาเองใน `client/styles/*` เพื่อตกแต่ง UI หรือแก้ปัญหาเฉพาะจุด
- WHY: เพื่อป้องกันปัญหา "Shadow CSS" หรือสไตล์แฝงที่อยู่นอกเหนือการควบคุมของ Design System ซึ่งมักก่อให้เกิด Class Collision, ความไม่สอดคล้องเมื่อสลับ Theme (Light/Dark Mode), ปัญหา Global Scope Pollution และเพิ่ม Dead Code ในระบบ ทุก UI Styling ต้องควบคุมผ่าน Tailwind Utilities และ Semantic Tokens ของ Design System โดยตรง

### 18. ห้ามใช้ Emoji ในการแสดงผลภาพหรือสัญลักษณ์บน UI เด็ดขาด เพื่อหลีกเลี่ยง SLOP Display

- ✅ ให้ใช้ SVG Icon จาก Lucide (`lucide-react`) หรือ Icon Library ที่มีอยู่แล้วในโปรเจกต์ ในการสื่อความหมาย แสดงสถานะ หรือประดับตกแต่ง UI
- 🚫 ห้ามใช้ Emoji ในการแสดงผลภาพ สัญลักษณ์ ไอคอน หรือตกแต่ง UI โดยเด็ดขาด
- WHY: เพื่อหลีกเลี่ยงการแสดงผลที่ดูด้อยคุณภาพ (SLOP Display) และความไม่สม่ำเสมอของการแสดงผล Emoji ข้ามแต่ละระบบปฏิบัติการ (OS-dependent rendering) อีกทั้ง Emoji ไม่สามารถควบคุมขนาดและสีตาม Theme Token (เช่น currentColor, stroke, fill) ให้เข้ากับ Design System ได้ การใช้ SVG Icons ช่วยรักษาความประณีตระดับมืออาชีพและความสม่ำเสมอของ Visual Language ทั่วทั้งระบบ

### 19. 1 ไฟล์ต่อ 1 Component (One Component per File) ยกเว้น Shared Primitives

- ✅ กำหนดให้ 1 ไฟล์ `.tsx` สร้างได้เพียง 1 Component เท่านั้น เพื่อรักษา Single Responsibility และความง่ายในการค้นหา/ดูแลรักษาโค้ด
- ✅ อนุญาตให้มีหลาย Component ในไฟล์เดียวกันได้เฉพาะกลุ่ม Primitive กลางใน `src/client/shared/components/*` และ `src/client/shared/shadcn/**` เพื่อรองรับ Composition / Presentation Pattern (เช่น `AppShellRoot`, `AppShellHeader`)
- 🚫 ห้ามสร้าง Component ซ้อนกัน 2 อันขึ้นไปในไฟล์เดียวกันใน `features/**`, `screens/` หรือ `core/**` และห้ามประกาศ Component ภายใน Function Body ของ Component อื่น (Nested Component) โดยเด็ดขาด
- WHY: เพื่อป้องกันการสร้าง Sub-components ย่อยเพื่อแอบส่ง Props ขัดกับ Zero Props Architecture, ตัดปัญหา React unmount/remount จาก Nested Function Closure และทำให้ Feature Components แต่ละตัวถูกผูกกับ Hook ประจำตัวได้อย่างเป็นอิสระและโปร่งใส

