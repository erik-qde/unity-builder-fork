import { getExecOutput, ExecOptions } from '@actions/exec';
import Input from './input';
import * as fs from 'fs';

export async function execWithErrorCheck(
  commandLine: string,
  arguments_?: string[],
  options?: ExecOptions,
  errorWhenMissingUnityBuildResults: boolean = true,
): Promise<number> {
  const result = await getExecOutput(commandLine, arguments_, options);

  if (Input.logFile !== '') {
    fs.writeFile(Input.logFile, result.stdout, () => {});
  }

  if (!errorWhenMissingUnityBuildResults) {
    return result.exitCode;
  }

  // Check for errors in the Build Results section
  const match = result.stdout.match(/^#\s*Build results\s*#(.*)^Size:/ms);

  if (match) {
    const buildResults = match[1];
    const errorMatch = buildResults.match(/^Errors:\s*(\d+)$/m);
    if (errorMatch && Number.parseInt(errorMatch[1], 10) !== 0) {
      throw new Error(`There was an error building the project. Please read the logs for details.`);
    }
  } else {
    throw new Error(`There was an error building the project. Please read the logs for details.`);
  }

  return result.exitCode;
}
