import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Car } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center mt-15 gap-5">
      <Card className="w-[80%]">
        <CardContent>
          <CardTitle>Hello</CardTitle>
          <CardDescription>
            Private and verified elections for your club or org{" "}
          </CardDescription>
        </CardContent>
      </Card>

      <Card className="w-[80%]">
        <CardContent>
          <CardTitle className="mb-3">Start anonymous, trustworthy voting</CardTitle>
          <CardDescription className="mb-7">
            Set up elections, issue one-time tokens and let members verify
            results using receipt
          </CardDescription>

          <div className="flex justify-between">
            <div className="flex gap-6">
              <Button className="cursor-pointer p-5">I am admin</Button>
              <Button className="cursor-pointer p-5">I am Voter</Button>
            </div>
            <Button className="cursor-pointer p-5">Start Vote</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
