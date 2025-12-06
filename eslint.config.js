import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import nextConfig from "eslint-config-next";

export default [...nextCoreWebVitals, ...nextTypescript, ...nextConfig, {
  rules: {
    "@next/next/no-img-element": "error",
  },
}, {
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
}];
