import sum from "./../libs/utils/sum";

export default function Home() {
  return <h1>{sum(1, 2, 3).toString()}</h1>;
}
