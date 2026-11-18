import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import process from "node:process";

interface AuditViolation {
	readonly rule: string;
	readonly file: string;
	readonly detail: string;
}

function walkSourceFiles(dir: string): string[] {
	const entries = readdirSync(dir);
	const collected: string[] = [];

	for (const entry of entries) {
		const fullPath = join(dir, entry);
		const stat = statSync(fullPath);
		if (stat.isDirectory()) {
			collected.push(...walkSourceFiles(fullPath));
		} else if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
			collected.push(fullPath);
		}
	}

	return collected;
}

const EMOJI_PATTERN = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const IMPORT_SOURCE_PATTERN =
	/import\s+(?:type\s+)?[\s\S]*?\s+from\s+["']([^"']+)["']/g;
const EXPLICIT_ANY_PATTERN = /\b:\s*any\b|\bas\s+any\b|<any>/;
const TS_SUPPRESS_PATTERN = /@ts-(?:ignore|expect-error|nocheck)/;
const WILDCARD_IMPORT_PATTERN = /^\s*import\s+\*\s+as\s+/;

const allFiles = walkSourceFiles("src").filter(
	(filePath) =>
		!filePath.includes("shared\\shadcn") &&
		!filePath.includes("shared/shadcn") &&
		!filePath.endsWith("routeTree.gen.ts"),
);

const violations: AuditViolation[] = [];

for (const filePath of allFiles) {
	const relPath = relative("src", filePath).replaceAll("\\", "/");
	const content = readFileSync(filePath, "utf8");
	const lines = content.split(/\r?\n/);

	if (relPath.endsWith("/index.ts") && !relPath.startsWith("routes/")) {
		violations.push({
			rule: "globals.md#5 (No Barrel Files)",
			file: relPath,
			detail: "พบไฟล์ index.ts นอก routes/ ซึ่งอาจเป็น Barrel File",
		});
	}

	if (relPath.startsWith("server/domain/")) {
		const importMatches = [...content.matchAll(IMPORT_SOURCE_PATTERN)];
		for (const match of importMatches) {
			const source = match[1] ?? "";
			const isAllowedDomainImport =
				source.startsWith("#/server/domain/") ||
				source.startsWith("#/shared/schemas/") ||
				source.startsWith("./") ||
				source.startsWith("../");
			if (!isAllowedDomainImport) {
				violations.push({
					rule: "server.md#1 (Pure Domain Dependency)",
					file: relPath,
					detail: `Domain ห้าม import '${source}'`,
				});
			}
		}
	}

	if (relPath.startsWith("server/application/")) {
		const importMatches = [...content.matchAll(IMPORT_SOURCE_PATTERN)];
		for (const match of importMatches) {
			const source = match[1] ?? "";
			const isForbiddenApplicationImport =
				source.startsWith("#/server/infrastructure/") ||
				source.startsWith("#/server/composition/") ||
				source.startsWith("#/server-functions/") ||
				source.startsWith("drizzle-orm");
			if (isForbiddenApplicationImport) {
				violations.push({
					rule: "server.md#1 & #10 (Application Layer Isolation)",
					file: relPath,
					detail: `Application ห้าม import '${source}'`,
				});
			}
		}
	}

	if (
		relPath.startsWith("routes/") &&
		(content.includes("/components/") || content.includes("#/server/"))
	) {
		violations.push({
			rule: "client.md#1 & server.md#2 (Route Purity)",
			file: relPath,
			detail: "Route ห้ามประกอบ features/**/components หรือ import #/server/",
		});
	}

	if (
		relPath.startsWith("client/") &&
		!relPath.startsWith("client/caches/") &&
		content.includes("toast.")
	) {
		violations.push({
			rule: "client.md#8 (Centralized Mutation Toast)",
			file: relPath,
			detail: "พบการเรียก toast นอก client/caches/",
		});
	}

	if (
		relPath.startsWith("client/features/") &&
		content.includes("#/server-functions/")
	) {
		violations.push({
			rule: "server.md#3 (Cache Gateway Ownership)",
			file: relPath,
			detail:
				"Feature ห้ามเรียก #/server-functions/ โดยตรง ให้เรียกผ่าน client/caches/",
		});
	}

	if (relPath.startsWith("server-functions/") && relPath.endsWith(".fn.ts")) {
		if (!content.includes(".middleware(")) {
			violations.push({
				rule: "server.md#18 (Server Function Middleware)",
				file: relPath,
				detail: "Server Function ควรมี Auth/Permission/Error Middleware",
			});
		}
	}

	if (
		relPath.startsWith("client/features/") &&
		relPath.endsWith(".tsx") &&
		!relPath.includes("/contexts/")
	) {
		const exportedComponents = [
			...content.matchAll(/^export\s+(?:function|const)\s+[A-Z]/gm),
		];
		const localComponents = [
			...content.matchAll(/^function\s+[A-Z][A-Za-z0-9]*\s*\(/gm),
		];
		if (exportedComponents.length + localComponents.length > 1) {
			violations.push({
				rule: "client.md#19 (1 Component per File)",
				file: relPath,
				detail: "พบ Component มากกว่า 1 ตัวในไฟล์เดียวกัน",
			});
		}

		if (relPath.includes("/components/")) {
			const fnMatch = content.match(
				/export\s+function\s+([A-Z]\w*)\s*\(([^)]*)\)/,
			);
			const rawParams = fnMatch?.[2]?.trim() ?? "";
			if (rawParams.length > 0) {
				violations.push({
					rule: "client.md#2 (Zero Props Architecture)",
					file: relPath,
					detail: `Component '${fnMatch?.[1]}' รับ parameter '${rawParams}'`,
				});
			}
		}
	}

	lines.forEach((line, index) => {
		const lineNumber = index + 1;
		if (line.includes("../../")) {
			violations.push({
				rule: "globals.md#2 (No Deep Relative Imports)",
				file: `${relPath}:${lineNumber}`,
				detail: line.trim(),
			});
		}
		if (WILDCARD_IMPORT_PATTERN.test(line)) {
			violations.push({
				rule: "globals.md#4 (No Wildcard Imports)",
				file: `${relPath}:${lineNumber}`,
				detail: line.trim(),
			});
		}
		if (EXPLICIT_ANY_PATTERN.test(line)) {
			violations.push({
				rule: "globals.md#8 (No Explicit any)",
				file: `${relPath}:${lineNumber}`,
				detail: line.trim(),
			});
		}
		if (TS_SUPPRESS_PATTERN.test(line)) {
			violations.push({
				rule: "globals.md#8 (No TS Error Suppression)",
				file: `${relPath}:${lineNumber}`,
				detail: line.trim(),
			});
		}
		if (
			line.includes("process.env") &&
			!relPath.endsWith("server/config/env.ts")
		) {
			violations.push({
				rule: "server.md#19 (Centralized env.ts)",
				file: `${relPath}:${lineNumber}`,
				detail: "เข้าถึง process.env นอก server/config/env.ts",
			});
		}
		if (relPath.startsWith("client/") && line.includes("#/server/")) {
			violations.push({
				rule: "server.md#2 (Client/Server Boundary)",
				file: `${relPath}:${lineNumber}`,
				detail: line.trim(),
			});
		}
		if (
			relPath.startsWith("client/") &&
			(line.includes("border-") ||
				line.includes("ring-") ||
				(/\bborder\b/.test(line) && line.includes("className=")))
		) {
			violations.push({
				rule: "client.md#15 (No Raw Border/Ring)",
				file: `${relPath}:${lineNumber}`,
				detail: line.trim(),
			});
		}
		if (relPath.startsWith("client/") && EMOJI_PATTERN.test(line)) {
			violations.push({
				rule: "client.md#18 (No Emoji in UI)",
				file: `${relPath}:${lineNumber}`,
				detail: line.trim(),
			});
		}
	});
}

if (violations.length === 0) {
	console.log(
		`[PASS] Architecture & Design Audit ผ่านครบทุกข้อ (ตรวจสอบแล้ว ${allFiles.length} ไฟล์)`,
	);
} else {
	console.error(`[FAIL] พบความไม่สอดคล้อง ${violations.length} รายการ:`);
	for (const violation of violations) {
		console.error(
			`- [${violation.rule}] ${violation.file}: ${violation.detail}`,
		);
	}
	process.exitCode = 1;
}
