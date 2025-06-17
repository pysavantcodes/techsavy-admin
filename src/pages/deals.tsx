import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const deals = [
  {
    id: 1,
    name: "Raw Black T-Shirt Lineup",
    period: "2 weeks",
    discount: "20%",
    image: "👕",
  },
  {
    id: 2,
    name: "Raw Black T-Shirt Lineup",
    period: "2 weeks",
    discount: "20%",
    image: "👕",
  },
  {
    id: 3,
    name: "Raw Black T-Shirt Lineup",
    period: "2 weeks",
    discount: "20%",
    image: "👕",
  },
  {
    id: 4,
    name: "Raw Black T-Shirt Lineup",
    period: "2 weeks",
    discount: "20%",
    image: "👕",
  },
  {
    id: 5,
    name: "Raw Black T-Shirt Lineup",
    period: "2 weeks",
    discount: "20%",
    image: "👕",
  },
  {
    id: 6,
    name: "Raw Black T-Shirt Lineup",
    period: "2 weeks",
    discount: "20%",
    image: "👕",
  },
  {
    id: 7,
    name: "Raw Black T-Shirt Lineup",
    period: "2 weeks",
    discount: "20%",
    image: "👕",
  },
  {
    id: 8,
    name: "Raw Black T-Shirt Lineup",
    period: "2 weeks",
    discount: "20%",
    image: "👕",
  },
];

export function Deals() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-600">Deals</h1>
        <Button className="bg-green-600 hover:bg-green-700">Add Deals</Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">↕</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => (
              <TableRow key={deal.id}>
                <TableCell>
                  <div className="text-2xl">{deal.image}</div>
                </TableCell>
                <TableCell className="font-medium">{deal.name}</TableCell>
                <TableCell>{deal.period}</TableCell>
                <TableCell>{deal.discount}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Deal</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center space-x-2">
        <Button variant="outline" size="sm">
          ←
        </Button>
        <Button variant="outline" size="sm">
          1
        </Button>
        <Button variant="outline" size="sm">
          2
        </Button>
        <span>...</span>
        <Button variant="outline" size="sm">
          23
        </Button>
        <Button variant="outline" size="sm">
          24
        </Button>
        <Button variant="outline" size="sm">
          →
        </Button>
      </div>
    </div>
  );
}
