import { FHECounterDemo } from "@/components/FHECounterDemo";
import { FHEHealthCheckerDemo } from "@/components/FHEHealthCheckerDemo";

export default function Home() {
  return (
    <main className="">
      <div className="flex flex-col gap-8 items-center sm:items-start w-full px-3 md:px-0">
        <FHEHealthCheckerDemo />
        <div className="w-full border-t-2 border-gray-300 my-8"></div>
        <FHECounterDemo />
      </div>
    </main>
  );
}
