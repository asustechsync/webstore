import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { architectureRules, ignores } from "@webstore/eslint-config/base";

const config = [ignores, ...nextVitals, ...nextTs, architectureRules];

export default config;
