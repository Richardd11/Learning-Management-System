import { useState } from "react";
import { motion } from "framer-motion";
import { Users, GraduationCap, Plus, Edit2, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { ApiResponse, AcademicLevel, Section } from "@/types";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export function SectionManagement() {
  const queryClient = useQueryClient();

  const { data: levels, isLoading } = useQuery({
    queryKey: ["academicLevels"],
    queryFn: () => api.get<ApiResponse<AcademicLevel[]>>("/levels/levels"),
    select: (res) => res.data ?? [],
  });

  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [showAddSection, setShowAddSection] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sectionForm, setSectionForm] = useState({
    name: "",
    schoolYear: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
    capacity: "",
    semester: "FIRST" as "FIRST" | "SECOND" | "SUMMER",
  });
  const [editForm, setEditForm] = useState({ name: "", capacity: "" });

  const selectedLevel = levels?.find((l) => l.id === selectedLevelId);
  const sections = selectedLevel?.sections ?? [];

  const createMutation = useMutation({
    mutationFn: (data: typeof sectionForm) =>
      api.post<ApiResponse<Section>>("/academics/sections", {
        ...data,
        academicLevelId: selectedLevelId,
        capacity: data.capacity ? Number(data.capacity) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academicLevels"] });
      setShowAddSection(false);
      setSectionForm({ name: "", schoolYear: sectionForm.schoolYear, capacity: "", semester: "FIRST" });
      toast.success("Section created");
    },
    onError: () => toast.error("Failed to create section"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; capacity?: number | null } }) =>
      api.put<ApiResponse<Section>>(`/academics/sections/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academicLevels"] });
      setEditingId(null);
      toast.success("Section updated");
    },
    onError: () => toast.error("Failed to update section"),
  });

  const startEdit = (s: Section) => {
    setEditingId(s.id);
    setEditForm({ name: s.name, capacity: s.capacity ? String(s.capacity) : "" });
  };

  const saveEdit = (id: string) => {
    updateMutation.mutate({
      id,
      data: {
        name: editForm.name,
        capacity: editForm.capacity ? Number(editForm.capacity) : null,
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-1">Section Management</h1>
        <p className="text-muted-foreground">View and manage sections for each academic level</p>
      </motion.div>

      {/* Level picker */}
      <Card>
        <CardContent className="p-4">
          <label className="text-sm font-medium mb-1 block">Academic Level</label>
          {isLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <select
              className="w-full border rounded-md px-3 py-2 text-sm h-9"
              value={selectedLevelId}
              onChange={(e) => { setSelectedLevelId(e.target.value); setShowAddSection(false); }}
            >
              <option value="">Select a level…</option>
              {levels?.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.gradeLabel} ({l.schoolYear}) — {l.sections?.length ?? 0} sections
                </option>
              ))}
            </select>
          )}
        </CardContent>
      </Card>

      {!selectedLevelId && (
        <div className="text-center py-16 text-muted-foreground">
          <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>Select an academic level to manage its sections</p>
        </div>
      )}

      {selectedLevelId && (
        <>
          {/* Level info */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <GraduationCap className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold">{selectedLevel?.gradeLabel}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedLevel?.schoolYear} · {selectedLevel?.type.replace("_", " ")}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-2xl font-bold">{sections.length}</p>
                <p className="text-xs text-muted-foreground">sections</p>
              </div>
            </CardContent>
          </Card>

          {/* Section list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sections</h2>
              <Button size="sm" onClick={() => setShowAddSection((v) => !v)}>
                <Plus className="h-4 w-4 mr-1" /> Add Section
              </Button>
            </div>

            {/* Add form */}
            {showAddSection && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-primary/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">New Section</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Name</label>
                        <Input
                          placeholder="e.g. Section A"
                          value={sectionForm.name}
                          onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">School Year</label>
                        <Input
                          placeholder="2025-2026"
                          value={sectionForm.schoolYear}
                          onChange={(e) => setSectionForm({ ...sectionForm, schoolYear: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Semester</label>
                        <select
                          className="w-full border rounded-md px-3 py-2 text-sm h-9"
                          value={sectionForm.semester}
                          onChange={(e) => setSectionForm({ ...sectionForm, semester: e.target.value as typeof sectionForm.semester })}
                        >
                          <option value="FIRST">First</option>
                          <option value="SECOND">Second</option>
                          <option value="SUMMER">Summer</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Capacity (optional)</label>
                        <Input
                          type="number"
                          placeholder="e.g. 40"
                          value={sectionForm.capacity}
                          onChange={(e) => setSectionForm({ ...sectionForm, capacity: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => createMutation.mutate(sectionForm)}
                        disabled={!sectionForm.name || createMutation.isPending}
                      >
                        {createMutation.isPending ? "Saving…" : "Create"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAddSection(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {sections.length === 0 && !showAddSection && (
              <div className="text-center py-10 text-muted-foreground border rounded-xl">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p>No sections yet. Add one above.</p>
              </div>
            )}

            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              {sections.map((s) => (
                <motion.div key={s.id} variants={item}>
                  <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {s.name.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0">
                        {editingId === s.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="h-8 text-sm"
                            />
                            <Input
                              type="number"
                              placeholder="Capacity"
                              value={editForm.capacity}
                              onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })}
                              className="h-8 text-sm w-28"
                            />
                          </div>
                        ) : (
                          <>
                            <p className="font-medium">{s.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {s.schoolYear} · {s.semester ?? "No semester"} · {s.currentEnrollment} enrolled
                              {s.capacity ? ` / ${s.capacity}` : ""}
                            </p>
                          </>
                        )}
                        {s.capacity && (
                          <Progress
                            value={Math.min((s.currentEnrollment / s.capacity) * 100, 100)}
                            className="h-1.5 mt-2"
                          />
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {s.capacity && (
                          <Badge variant={s.currentEnrollment >= s.capacity ? "destructive" : "secondary"}>
                            {s.currentEnrollment}/{s.capacity}
                          </Badge>
                        )}
                        {editingId === s.id ? (
                          <>
                            <Button size="icon" variant="ghost" onClick={() => saveEdit(s.id)}>
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        ) : (
                          <Button size="icon" variant="ghost" onClick={() => startEdit(s)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
