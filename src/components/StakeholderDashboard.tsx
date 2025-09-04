"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutDashboard, Check, MessageSquareDot, PanelRight, Undo, Dot } from "lucide-react";
import { toast } from "sonner";

interface ClaimData {
  id: string;
  parcelId: string;
  claimant: string;
  status: "requested" | "field-visit" | "verified" | "contested" | "closed";
  priority: "high" | "medium" | "low";
  submittedDate: string;
  assignedVerifier?: string;
  area: number;
  location: string;
  mapPreview: string;
}

interface Comment {
  id: string;
  author: string;
  role: string;
  content: string;
  timestamp: string;
  attachments?: string[];
}

interface TimelineEvent {
  id: string;
  type: "submission" | "assignment" | "field-visit" | "verification" | "comment" | "decision";
  description: string;
  timestamp: string;
  actor: string;
  details?: any;
}

type UserRole = "official" | "community" | "ngo";

const mockClaims: ClaimData[] = [
  {
    id: "CLM-001",
    parcelId: "P-2024-001",
    claimant: "Maria Santos",
    status: "requested",
    priority: "high",
    submittedDate: "2024-01-15",
    area: 2.5,
    location: "Sector 7A, Grid 45",
    mapPreview: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=120&fit=crop"
  },
  {
    id: "CLM-002",
    parcelId: "P-2024-002",
    claimant: "João Silva",
    status: "field-visit",
    priority: "medium",
    submittedDate: "2024-01-12",
    assignedVerifier: "Dr. Ana Costa",
    area: 1.8,
    location: "Sector 3B, Grid 23",
    mapPreview: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&h=120&fit=crop"
  },
  {
    id: "CLM-003",
    parcelId: "P-2024-003",
    claimant: "Community Collective",
    status: "verified",
    priority: "low",
    submittedDate: "2024-01-08",
    assignedVerifier: "Dr. Ana Costa",
    area: 5.2,
    location: "Sector 9C, Grid 67",
    mapPreview: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200&h=120&fit=crop"
  }
];

const mockComments: Comment[] = [
  {
    id: "1",
    author: "Dr. Ana Costa",
    role: "Forest Official",
    content: "Initial documentation review completed. Field visit scheduled for next week.",
    timestamp: "2024-01-16 14:30",
    attachments: ["verification-checklist.pdf"]
  },
  {
    id: "2",
    author: "Maria Santos",
    role: "Community Member",
    content: "Thank you for the update. I will be available for the field visit on Tuesday morning.",
    timestamp: "2024-01-16 16:45"
  }
];

const mockTimeline: TimelineEvent[] = [
  {
    id: "1",
    type: "submission",
    description: "Claim submitted with required documentation",
    timestamp: "2024-01-15 09:00",
    actor: "Maria Santos"
  },
  {
    id: "2",
    type: "assignment",
    description: "Assigned to Dr. Ana Costa for verification",
    timestamp: "2024-01-15 14:30",
    actor: "System"
  },
  {
    id: "3",
    type: "comment",
    description: "Initial review completed, field visit scheduled",
    timestamp: "2024-01-16 14:30",
    actor: "Dr. Ana Costa"
  }
];

export default function StakeholderDashboard() {
  const [currentRole, setCurrentRole] = useState<UserRole>("official");
  const [claims, setClaims] = useState<ClaimData[]>(mockClaims);
  const [selectedClaim, setSelectedClaim] = useState<ClaimData | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [newComment, setNewComment] = useState("");
  const [showTimelineDialog, setShowTimelineDialog] = useState(false);

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.claimant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.parcelId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || claim.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || claim.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "requested": return "bg-blue-100 text-blue-800";
      case "field-visit": return "bg-yellow-100 text-yellow-800";
      case "verified": return "bg-green-100 text-green-800";
      case "contested": return "bg-red-100 text-red-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = useCallback(async (claimId: string, newStatus: string) => {
    setIsLoading(true);
    try {
      // Optimistic update
      setClaims(prev => prev.map(claim => 
        claim.id === claimId 
          ? { ...claim, status: newStatus as any }
          : claim
      ));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Claim ${claimId} status updated to ${newStatus}`);
    } catch (error) {
      // Rollback on error
      setClaims(mockClaims);
      toast.error("Failed to update claim status");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleBulkAction = useCallback(async (action: string) => {
    if (selectedRows.length === 0) {
      toast.error("Please select claims to perform bulk action");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`${action} completed for ${selectedRows.length} claims`);
      setSelectedRows([]);
    } catch (error) {
      toast.error(`Failed to ${action.toLowerCase()}`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRows]);

  const handleAddComment = useCallback(async () => {
    if (!newComment.trim() || !selectedClaim) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success("Comment added successfully");
      setNewComment("");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  }, [newComment, selectedClaim]);

  const getRolePermissions = (role: UserRole) => {
    switch (role) {
      case "official":
        return {
          canVerify: true,
          canAssign: true,
          canChangeStatus: true,
          canExport: true
        };
      case "community":
        return {
          canVerify: false,
          canAssign: false,
          canChangeStatus: false,
          canExport: false
        };
      case "ngo":
        return {
          canVerify: false,
          canAssign: false,
          canChangeStatus: false,
          canExport: true
        };
      default:
        return {
          canVerify: false,
          canAssign: false,
          canChangeStatus: false,
          canExport: false
        };
    }
  };

  const permissions = getRolePermissions(currentRole);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Role Switcher & Overview Header */}
      <div className="border-b bg-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Stakeholder Dashboard</h1>
            <Select value={currentRole} onValueChange={(value: UserRole) => setCurrentRole(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="official">Forest Official</SelectItem>
                <SelectItem value="community">Community Leader</SelectItem>
                <SelectItem value="ngo">NGO Representative</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Card className="p-3">
              <div className="text-sm text-muted-foreground">Open Claims</div>
              <div className="text-2xl font-bold text-primary">
                {filteredClaims.filter(c => c.status !== "closed").length}
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-sm text-muted-foreground">Pending Verification</div>
              <div className="text-2xl font-bold text-warning">
                {filteredClaims.filter(c => c.status === "requested").length}
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-sm text-muted-foreground">Contested</div>
              <div className="text-2xl font-bold text-destructive">
                {filteredClaims.filter(c => c.status === "contested").length}
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search claims, claimants, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="field-visit">Field Visit</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="contested">Contested</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Claims Table & Actions */}
        <div className="flex-1 flex flex-col">
          {/* Bulk Actions Bar */}
          {selectedRows.length > 0 && (
            <div className="border-b bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedRows.length} claims selected
                </span>
                <div className="flex gap-2">
                  {permissions.canExport && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction("Export")}
                      disabled={isLoading}
                    >
                      Export Selected
                    </Button>
                  )}
                  {permissions.canAssign && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction("Assign")}
                      disabled={isLoading}
                    >
                      Bulk Assign
                    </Button>
                  )}
                  {permissions.canChangeStatus && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction("Mark Verified")}
                      disabled={isLoading}
                    >
                      Mark Verified
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Claims Table */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRows.length === filteredClaims.length}
                        onCheckedChange={(checked) => {
                          setSelectedRows(checked ? filteredClaims.map(c => c.id) : []);
                        }}
                      />
                    </TableHead>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Claimant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Area (ha)</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          Loading claims...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredClaims.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No claims found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClaims.map((claim) => (
                      <TableRow key={claim.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.includes(claim.id)}
                            onCheckedChange={(checked) => {
                              setSelectedRows(prev =>
                                checked
                                  ? [...prev, claim.id]
                                  : prev.filter(id => id !== claim.id)
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">{claim.id}</TableCell>
                        <TableCell>{claim.claimant}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(claim.status)}>
                            {claim.status.replace("-", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getPriorityColor(claim.priority)}>
                            {claim.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {claim.location}
                        </TableCell>
                        <TableCell>{claim.area}</TableCell>
                        <TableCell>
                          <img
                            src={claim.mapPreview}
                            alt="Map preview"
                            className="w-12 h-8 rounded object-cover"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedClaim(claim);
                                setShowTimelineDialog(true);
                              }}
                            >
                              <MessageSquareDot className="h-4 w-4" />
                            </Button>
                            {permissions.canChangeStatus && (
                              <Select
                                value={claim.status}
                                onValueChange={(value) => handleStatusChange(claim.id, value)}
                              >
                                <SelectTrigger className="w-24 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="requested">Requested</SelectItem>
                                  <SelectItem value="field-visit">Field Visit</SelectItem>
                                  <SelectItem value="verified">Verified</SelectItem>
                                  <SelectItem value="contested">Contested</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>

        {/* Claim Timeline & Conversation Dialog */}
        <Dialog open={showTimelineDialog} onOpenChange={setShowTimelineDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PanelRight className="h-5 w-5" />
                Claim Details: {selectedClaim?.id}
              </DialogTitle>
              <DialogDescription>
                Track progress and communicate about this forest claim
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="timeline" className="flex-1">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="verification">Verification</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  {/* Timeline */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Audit Timeline</h3>
                    <ScrollArea className="h-64">
                      <div className="space-y-4">
                        {mockTimeline.map((event) => (
                          <div key={event.id} className="flex gap-3">
                            <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">{event.description}</div>
                              <div className="text-xs text-muted-foreground">
                                {event.actor} • {event.timestamp}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Comments */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Comments & Communication</h3>
                    <ScrollArea className="h-48 mb-4">
                      <div className="space-y-3">
                        {mockComments.map((comment) => (
                          <div key={comment.id} className="bg-muted p-3 rounded">
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium text-sm">{comment.author}</div>
                              <div className="text-xs text-muted-foreground">{comment.timestamp}</div>
                            </div>
                            <div className="text-sm">{comment.content}</div>
                            {comment.attachments && (
                              <div className="mt-2">
                                {comment.attachments.map((attachment, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs mr-1">
                                    {attachment}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Add Comment */}
                    <div className="space-y-2">
                      <Label htmlFor="comment">Add Comment</Label>
                      <Textarea
                        id="comment"
                        placeholder="Enter your comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                        Add Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="verification">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Verification Workflow</h3>
                  
                  {permissions.canVerify ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Field Visit Checklist</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="boundaries" />
                            <Label htmlFor="boundaries" className="text-sm">Verify plot boundaries</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="usage" />
                            <Label htmlFor="usage" className="text-sm">Document current land usage</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="community" />
                            <Label htmlFor="community" className="text-sm">Community consultation</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="evidence" />
                            <Label htmlFor="evidence" className="text-sm">Collect photo evidence</Label>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Assignment & Scheduling</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label htmlFor="verifier">Assign Verifier</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select verifier" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ana">Dr. Ana Costa</SelectItem>
                                <SelectItem value="carlos">Carlos Rodriguez</SelectItem>
                                <SelectItem value="lucia">Lucia Fernandez</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="visit-date">Schedule Visit</Label>
                            <Input id="visit-date" type="date" />
                          </div>
                          <Button className="w-full">
                            <Check className="h-4 w-4 mr-2" />
                            Schedule Field Visit
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      You do not have permission to access verification tools.
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="documents">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Documents & Evidence</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card className="p-4 text-center">
                      <div className="text-sm font-medium">Land Survey</div>
                      <div className="text-xs text-muted-foreground mt-1">survey-2024.pdf</div>
                      <Button variant="outline" size="sm" className="mt-2">
                        View
                      </Button>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-sm font-medium">Community Letter</div>
                      <div className="text-xs text-muted-foreground mt-1">support-letter.pdf</div>
                      <Button variant="outline" size="sm" className="mt-2">
                        View
                      </Button>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-sm font-medium">Field Photos</div>
                      <div className="text-xs text-muted-foreground mt-1">5 images</div>
                      <Button variant="outline" size="sm" className="mt-2">
                        View
                      </Button>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}