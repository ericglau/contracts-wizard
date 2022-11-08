export const opSecOptions = [{}, { defender: true }] as const;

export const defaults: OpSec = { defender: false };

export type OpSec = {
  defender?: boolean;
}