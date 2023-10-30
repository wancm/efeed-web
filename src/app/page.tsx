import { cacheService } from "@/libs/shared/cache/cache-service";

let sessionDisplay = "this is session";
let counter = 1;

sessionDisplay = `${sessionDisplay} ${counter}`;

const sessionStart = async () => {
  cacheService.trySetAsync(
    "session",
    {
      name: "this is session",
    },
    10
  );
};

const sessionPooling = async () => {
  const session = await cacheService.tryGetAsync("session");
  counter++;

  if (session) {
    sessionDisplay = `${sessionDisplay} ${counter}`;

    setTimeout(async () => {
      await sessionPooling();
    }, 1000);
  } else {
    sessionDisplay = `session expired`;
  }
};

export default async function Home() {
  const session = await sessionStart();

  setTimeout(async () => {
    await sessionPooling();
  }, 1000);

  return <h1>{`${sessionDisplay}`}</h1>;
}
