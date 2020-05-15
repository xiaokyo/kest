import { Greeter } from "../index";

test("Greeter test", () => {
  expect(Greeter("Carl")).toBe("Hello Carl");
});
