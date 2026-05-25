import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Search, Star, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourses } from "@/hooks/use-courses";
import { formatPrice, getDifficultyColor, truncate } from "@/lib/utils";

const difficulties = ["all", "beginner", "intermediate", "advanced"];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function CatalogPage() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useCourses({
    search: search || undefined,
    difficulty: difficulty === "all" ? undefined : difficulty,
    page,
    limit: 12,
  } as Record<string, string | number>);

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Course Catalog</h1>
        <p className="text-muted-foreground mb-8">Discover courses to expand your skills</p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {difficulties.map((d) => (
            <motion.div key={d} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant={difficulty === d ? "default" : "outline"}
                size="sm"
                onClick={() => { setDifficulty(d); setPage(1); }}
                className="capitalize"
              >
                {d === "all" && <Filter className="h-3 w-3 mr-1" />}
                {d}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-40 rounded-t-xl" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.data.map((course) => (
              <motion.div key={course.id} variants={item}>
                <Link to={`/courses/${course.slug}`}>
                  <motion.div whileHover={{ y: -4, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="overflow-hidden h-full cursor-pointer">
                      <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="text-4xl">📚</span>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className={getDifficultyColor(course.difficulty)}>
                            {course.difficulty}
                          </Badge>
                          {course.rating > 0 && (
                            <span className="flex items-center text-xs text-muted-foreground">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-0.5" />
                              {course.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold mb-1 line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {truncate(course.shortDesc ?? course.description, 80)}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            {course.instructor?.firstName} {course.instructor?.lastName}
                          </p>
                          <p className="font-bold text-primary">{formatPrice(course.price)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {data.totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground mb-4">No courses found</p>
          <Button variant="outline" onClick={() => { setSearch(""); setDifficulty("all"); }}>Clear filters</Button>
        </div>
      )}
    </div>
  );
}
