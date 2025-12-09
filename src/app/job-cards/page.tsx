'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Eye, Printer, FileText, ClipboardList, Scissors } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface JobCard {
    id: number;
    setNo: string;
    date: string;
    warpingDate: string | null;
    sizingDate: string | null;
    companyId: number;
    companyName: string;
    partyId: number;
    partyName: string;
    loomTypeId: number | null;
    loomTypeName: string | null;
    millName: string;
    count: string;
    ends: number;
    beamWidth: string;
    warpingMetres: number;
    status: string;
    hasWarping: boolean;
    hasSizing: boolean;
}

export default function JobCardsPage() {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<JobCard | null>(null);
    const [activeTab, setActiveTab] = useState('warping');
    const queryClient = useQueryClient();

    // Form state for new job card
    const [formData, setFormData] = useState({
        setNo: '',
        date: new Date().toISOString().split('T')[0],
        partyId: '',
        companyId: '',
        loomTypeId: '',
        count: '',
        ends: '',
    });

    // Fetch job cards
    const { data: jobCards, isLoading } = useQuery<JobCard[]>({
        queryKey: ['job-cards'],
        queryFn: async () => {
            const response = await fetch('/api/job-cards');
            if (!response.ok) throw new Error('Failed to fetch job cards');
            return response.json();
        },
    });

    // Fetch parties
    const { data: parties } = useQuery({
        queryKey: ['parties'],
        queryFn: async () => {
            const response = await fetch('/api/parties');
            if (!response.ok) throw new Error('Failed to fetch parties');
            return response.json();
        },
    });

    // Fetch companies
    const { data: companies } = useQuery({
        queryKey: ['companies'],
        queryFn: async () => {
            const response = await fetch('/api/companies');
            if (!response.ok) throw new Error('Failed to fetch companies');
            return response.json();
        },
    });

    // Fetch loom types
    const { data: loomTypes } = useQuery({
        queryKey: ['loom-types'],
        queryFn: async () => {
            const response = await fetch('/api/master/loom-types');
            if (!response.ok) throw new Error('Failed to fetch loom types');
            return response.json();
        },
    });

    // Create job card mutation
    const createJobCard = useMutation({
        mutationFn: async (data: any) => {
            const response = await fetch('/api/job-cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to create job card');
            }
            return response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['job-cards'] });
            setIsDialogOpen(false);
            resetForm();
            toast.success('Job Card created! Redirecting to details...');
            router.push(`/job-cards/${encodeURIComponent(data.setNo)}`);
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create job card');
        },
    });

    const resetForm = () => {
        setFormData({
            setNo: '',
            date: new Date().toISOString().split('T')[0],
            partyId: '',
            companyId: '',
            loomTypeId: '',
            count: '',
            ends: '',
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createJobCard.mutate(formData);
    };

    const handleView = (card: JobCard) => {
        setSelectedCard(card);
        setViewDialogOpen(true);
    };

    const handlePrint = (card: JobCard) => {
        const printContent = `
      <html>
      <head>
        <title>Job Card - ${card.setNo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1, h2 { text-align: center; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #333; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; font-weight: bold; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
          .section { margin: 20px 0; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ORANGE SIZING UNIT</h1>
          <h2>JOB CARD</h2>
        </div>
        <table>
          <tr><th>Set No</th><td>${card.setNo}</td><th>Party</th><td>${card.partyName}</td></tr>
          <tr><th>Warping Date</th><td>${card.warpingDate ? new Date(card.warpingDate).toLocaleDateString() : '-'}</td><th>Sizing Date</th><td>${card.sizingDate ? new Date(card.sizingDate).toLocaleDateString() : '-'}</td></tr>
          <tr><th>Count</th><td>${card.count || '-'}</td><th>Ends</th><td>${card.ends || '-'}</td></tr>
          <tr><th>Loom Type</th><td>${card.loomTypeName || '-'}</td><th>Beam Width</th><td>${card.beamWidth || '-'}</td></tr>
          <tr><th>Mill Name</th><td>${card.millName || '-'}</td><th>Warping Metres</th><td>${card.warpingMetres || '-'}</td></tr>
          <tr><th>Status</th><td colspan="3">${card.status}</td></tr>
        </table>
      </body>
      </html>
    `;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'SIZING': return 'bg-blue-100 text-blue-800';
            case 'WARPING': return 'bg-yellow-100 text-yellow-800';
            case 'INVOICED': return 'bg-purple-100 text-purple-800';
            case 'PENDING': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Job Cards</h1>
                    <p className="text-muted-foreground">Manage sizing and warping job cards</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Job Card
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Start New Job Card</DialogTitle>
                            <DialogDescription>
                                Enter the basic identity details. You will be redirected to the full form to add Warping and Sizing details.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            {/* Basic Information */}
                            <div>
                                <Label htmlFor="setNo">Set No *</Label>
                                <Input
                                    id="setNo"
                                    value={formData.setNo}
                                    onChange={(e) => setFormData(prev => ({ ...prev, setNo: e.target.value }))}
                                    placeholder="399A"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="companyId">Company *</Label>
                                    <Select value={formData.companyId} onValueChange={(v) => setFormData(prev => ({ ...prev, companyId: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Select Company" /></SelectTrigger>
                                        <SelectContent>
                                            {companies?.map((c: any) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="partyId">Party *</Label>
                                    <Select value={formData.partyId} onValueChange={(v) => setFormData(prev => ({ ...prev, partyId: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Select Party" /></SelectTrigger>
                                        <SelectContent>
                                            {parties?.map((p: any) => (
                                                <SelectItem key={p.id} value={p.id.toString()}>
                                                    {p.partyName} {p.gstin ? `(${p.gstin})` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="loomTypeId">Loom Type</Label>
                                    <Select value={formData.loomTypeId} onValueChange={(v) => setFormData(prev => ({ ...prev, loomTypeId: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Select Loom Type" /></SelectTrigger>
                                        <SelectContent>
                                            {loomTypes?.map((lt: any) => (
                                                <SelectItem key={lt.id} value={lt.id.toString()}>{lt.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="count">Count</Label>
                                    <Input
                                        id="count"
                                        value={formData.count}
                                        onChange={(e) => setFormData(prev => ({ ...prev, count: e.target.value }))}
                                        placeholder="30's vortex"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="ends">Ends</Label>
                                    <Input
                                        id="ends"
                                        type="number"
                                        value={formData.ends}
                                        onChange={(e) => setFormData(prev => ({ ...prev, ends: e.target.value }))}
                                        placeholder="4800"
                                    />
                                </div>
                            </div>



                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createJobCard.isPending}>
                                    {createJobCard.isPending ? 'Creating...' : 'Create & Continue'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Job Cards</CardTitle>
                        <FileText className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{jobCards?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Warping</CardTitle>
                        <ClipboardList className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {jobCards?.filter(j => j.status === 'WARPING').length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Sizing</CardTitle>
                        <Scissors className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {jobCards?.filter(j => j.status === 'SIZING').length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <FileText className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {jobCards?.filter(j => j.status === 'COMPLETED').length || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Job Cards Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Job Cards</CardTitle>
                    <CardDescription>
                        Click on a job card to view/edit warping and sizing details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p className="text-center py-8">Loading...</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Set No</TableHead>
                                    <TableHead>Party</TableHead>
                                    <TableHead>Warping Date</TableHead>
                                    <TableHead>Sizing Date</TableHead>
                                    <TableHead>Count</TableHead>
                                    <TableHead>Ends</TableHead>
                                    <TableHead>Loom Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jobCards?.map((card) => (
                                    <TableRow key={card.id}>
                                        <TableCell className="font-medium">{card.setNo}</TableCell>
                                        <TableCell>{card.partyName}</TableCell>
                                        <TableCell>
                                            {card.warpingDate ? new Date(card.warpingDate).toLocaleDateString() : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {card.sizingDate ? new Date(card.sizingDate).toLocaleDateString() : '-'}
                                        </TableCell>
                                        <TableCell>{card.count || '-'}</TableCell>
                                        <TableCell>{card.ends || '-'}</TableCell>
                                        <TableCell>{card.loomTypeName || '-'}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(card.status)}>
                                                {card.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => handleView(card)} title="View Details">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => window.location.href = `/job-cards/${card.setNo}`} title="Edit">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handlePrint(card)} title="Print">
                                                    <Printer className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* View Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Job Card Details - {selectedCard?.setNo}</DialogTitle>
                    </DialogHeader>
                    {selectedCard && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Set No</Label>
                                    <p className="font-medium">{selectedCard.setNo}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Party</Label>
                                    <p className="font-medium">{selectedCard.partyName}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Warping Date</Label>
                                    <p className="font-medium">
                                        {selectedCard.warpingDate ? new Date(selectedCard.warpingDate).toLocaleDateString() : 'Not set'}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Sizing Date</Label>
                                    <p className="font-medium">
                                        {selectedCard.sizingDate ? new Date(selectedCard.sizingDate).toLocaleDateString() : 'Not set'}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Count</Label>
                                    <p className="font-medium">{selectedCard.count || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Ends</Label>
                                    <p className="font-medium">{selectedCard.ends || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Loom Type</Label>
                                    <p className="font-medium">{selectedCard.loomTypeName || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <Badge className={getStatusColor(selectedCard.status)}>
                                        {selectedCard.status}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => handlePrint(selectedCard)}>
                                    <Printer className="h-4 w-4 mr-2" /> Print
                                </Button>
                                <Button onClick={() => window.location.href = `/job-cards/${selectedCard.setNo}`}>
                                    <Edit className="h-4 w-4 mr-2" /> Edit Full Details
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
