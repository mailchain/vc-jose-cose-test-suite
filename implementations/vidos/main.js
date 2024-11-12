#!/usr/bin/env node
import { program, CommanderError } from "commander";
import { readFile, writeFile } from 'node:fs/promises'

console.log("SHUBUDUBU 1");

const VERIFIER_URL = 'https://local-test.verifier.service.eu.vidos.local';
const VIDOS_API_KEY = 'db712782937b8518383803eb1e3aaa3dfa4eca5df5a4af71e221aa9edbc6f3d7';

program
    .requiredOption("--input <input_file>", "Path to the input file within the container")
    .requiredOption("--config <config_json>", "JSON string containing test configuration")
    .requiredOption("--output <output_file>", "Path where the output should be written within the container")
    .action(async (options) => {
        console.log(`Running Vidos implementation with input: ${options.input}, config: ${options.config}, output: ${options.output}`);

        const credential = await readFile(options.input).then(buffer => buffer.toString());

        console.dir(credential, { depth: null });

        const response = await fetch(`${VERIFIER_URL}/vidos/verifier/v0.0.1/verify`, {
            method: 'POST', headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${VIDOS_API_KEY}`
            },
            body: `{"credential": ${credential}}`,
        })
        console.log({ status: response.status });

        if (!response.ok) throw new Error(`Failed to verify credential: ${response.statusText}`);
        const result = await response.json().then((vidosResult) => {
            if (!vidosResult.errors || vidosResult.errors.length === 0) {
                return { result: 'success', vidosResult };
            }
            return { result: 'failure', vidosResult };
        });

        await writeFile(options.output, JSON.stringify(result), 'utf8');
    });

program.parse(process.argv);