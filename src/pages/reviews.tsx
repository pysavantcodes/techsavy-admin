"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const reviews = [
  {
    id: 1,
    name: "Esther Howard",
    review:
      "Completed the task and added the required documentation, can someone please ...",
    initials: "EH",
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Wade Warren",
    review:
      "Ask CDCR San Quintin State Prison 2008. We installed Purex dispensers.",
    initials: "WW",
    color: "bg-blue-500",
  },
  {
    id: 3,
    name: "Brooklyn Simmons",
    review:
      "Twenty 30-second applications within half an hour is well in excess.",
    initials: "BS",
    color: "bg-blue-500",
  },
  {
    id: 4,
    name: "Robert Fox",
    review:
      "An interesting implication of the 2007 study concerns the use of hand sanitizers.",
    initials: "RF",
    color: "bg-blue-500",
  },
  {
    id: 5,
    name: "Dianne Russell",
    review:
      "I found a 2007 study on effects of hand sanitizers on blood alcohol level in adults.",
    initials: "DR",
    color: "bg-blue-500",
  },
  {
    id: 6,
    name: "Ralph Edwards",
    review:
      "The principal alcohol in Purell hand sanitizer (to take the most talked-about brand)",
    initials: "RE",
    color: "bg-blue-500",
  },
  {
    id: 7,
    name: "Theresa Webb",
    review:
      "Alcohol based exposures through inadvertently consuming hand sanitize",
    initials: "TW",
    color: "bg-blue-500",
  },
  {
    id: 8,
    name: "Arlene McCoy",
    review:
      "I'm grateful for the supportive work environment during personal challenges.",
    initials: "AM",
    color: "bg-blue-500",
  },
];

export function Reviews() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReviews = reviews.filter(
    (review) =>
      review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.review.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-600">Reviews</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
          <Input
            placeholder="Search reviews"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">↕</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <Avatar className="size-8">
                    <AvatarFallback
                      className={`${review.color} text-white text-xs`}
                    >
                      {review.initials}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{review.name}</TableCell>
                <TableCell className="max-w-md truncate">
                  {review.review}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Full Review</DropdownMenuItem>
                      <DropdownMenuItem>Reply</DropdownMenuItem>
                      <DropdownMenuItem>Mark as Featured</DropdownMenuItem>
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
