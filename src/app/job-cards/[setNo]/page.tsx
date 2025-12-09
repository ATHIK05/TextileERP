'use client';

import { useState, useEffect, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Plus, Trash2, Printer } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';

interface WarpingBeam {
    sno: number;
    beamNo: string;
    metre: number;
    ends: number;
    grossWeight: number;
    tareWeight: number;
    netWeight: number;
    startTime: string;
    finishTime: string;
    rpm: number;
    warperName: string;
    breaks: number;
    beamCount: number;
}

interface SizingBeam {
    frontRear: string;
    sno: number;
    beamNo: string;
    clothMetres: number;
    pcs: number;
    grossWeight: number;
    tareWeight: number;
    netWeight: number;
    readingMetres: number;
    startTime: string;
    finishTime: string;
    sizerName: string;
    backSizer: string;
    pickUps: number;
    vendorName: string;
    sizingComb: string;
    sizeBox: string;
    warpBeam: string;
    cylinder: string;
}

export default function JobCardDetailPage({ params }: { params: Promise<{ setNo: string }> }) {
    const resolvedParams = use(params);
    const setNo = decodeURIComponent(resolvedParams.setNo);
    const queryClient = useQueryClient();

    // Warping form state
    const [warpingData, setWarpingData] = useState({
        date: new Date().toISOString().split('T')[0],
        lengthInMtrs: '',
        machineNo: '',
        lotNo: '',
        coneWeight: '',
        preCheck: '',
        totalWarpBreaks: '',
        breaksPerMillion: '',
        fullBagsTaken: '',
        runOutConeTaken: '',
        totalYarnNWT: '',
        warpNWT: '',
        cutConeNWT: '',
        excessShortage: '',
        remarks: '',
        beams: [{ sno: 1, beamNo: '', metre: 0, ends: 0, grossWeight: 0, tareWeight: 0, netWeight: 0, startTime: '', finishTime: '', rpm: 0, warperName: '', breaks: 0, beamCount: 0 }] as WarpingBeam[],
        runOutCones: [] as any[],
        remnants: [] as any[],
    });

    // Sizing form state
    const [sizingData, setSizingData] = useState({
        date: new Date().toISOString().split('T')[0],
        machineName: '',
        setLength: '',
        markWheel: '',
        mark: '',
        tapeLength: '',
        beamWidth: '',
        noOfBeams: '',
        rf: '',
        viscosity: '',
        preCheck: '',
        pickUp: '',
        elongation: '',
        elongationPercent: '',
        avgPickUpPercent: '',
        frontWaste: '',
        backWaste: '',
        remarks: '',
        shiftSupervisor: '',
        checkedBy: '',
        manager: '',
        sizerSign: '',
        mdSign: '',
        fmSign: '',
        beams: [{ frontRear: '', sno: 1, beamNo: '', clothMetres: 0, pcs: 0, grossWeight: 0, tareWeight: 0, netWeight: 0, readingMetres: 0, startTime: '', finishTime: '', sizerName: '', backSizer: '', pickUps: 0, vendorName: '', sizingComb: '', sizeBox: '', warpBeam: '', cylinder: '' }] as SizingBeam[],
        shiftDetails: [] as any[],
        materials: [] as any[],
    });

    // Fetch job card
    const { data: jobCard, isLoading } = useQuery({
        queryKey: ['job-card', setNo],
        queryFn: async () => {
            const response = await fetch(`/api/job-cards/${encodeURIComponent(setNo)}`);
            if (!response.ok) throw new Error('Failed to fetch job card');
            return response.json();
        },
    });

    // Populate forms when data loads
    useEffect(() => {
        if (jobCard?.warpingCard) {
            const wc = jobCard.warpingCard;
            setWarpingData({
                date: wc.date ? new Date(wc.date).toISOString().split('T')[0] : '',
                lengthInMtrs: wc.lengthInMtrs || '',
                machineNo: wc.machineNo || '',
                lotNo: wc.lotNo || '',
                coneWeight: wc.coneWeight || '',
                preCheck: wc.preCheck || '',
                totalWarpBreaks: wc.totalWarpBreaks || '',
                breaksPerMillion: wc.breaksPerMillion || '',
                fullBagsTaken: wc.fullBagsTaken || '',
                runOutConeTaken: wc.runOutConeTaken || '',
                totalYarnNWT: wc.totalYarnNWT || '',
                warpNWT: wc.warpNWT || '',
                cutConeNWT: wc.cutConeNWT || '',
                excessShortage: wc.excessShortage || '',
                remarks: wc.remarks || '',
                beams: wc.beams?.length ? wc.beams : [{ sno: 1, beamNo: '', metre: 0, ends: 0, grossWeight: 0, tareWeight: 0, netWeight: 0, startTime: '', finishTime: '', rpm: 0, warperName: '', breaks: 0, beamCount: 0 }],
                runOutCones: wc.runOutCones || [],
                remnants: wc.remnants || [],
            });
        }
        if (jobCard?.sizingCard) {
            const sc = jobCard.sizingCard;
            setSizingData({
                date: sc.date ? new Date(sc.date).toISOString().split('T')[0] : '',
                machineName: sc.machineName || '',
                setLength: sc.setLength || '',
                markWheel: sc.markWheel || '',
                mark: sc.mark || '',
                tapeLength: sc.tapeLength || '',
                beamWidth: sc.beamWidth || '',
                noOfBeams: sc.noOfBeams || '',
                rf: sc.rf || '',
                viscosity: sc.viscosity || '',
                preCheck: sc.preCheck || '',
                pickUp: sc.pickUp || '',
                elongation: sc.elongation || '',
                elongationPercent: sc.elongationPercent || '',
                avgPickUpPercent: sc.avgPickUpPercent || '',
                frontWaste: sc.frontWaste || '',
                backWaste: sc.backWaste || '',
                remarks: sc.remarks || '',
                shiftSupervisor: sc.shiftSupervisor || '',
                checkedBy: sc.checkedBy || '',
                manager: sc.manager || '',
                sizerSign: sc.sizerSign || '',
                mdSign: sc.mdSign || '',
                fmSign: sc.fmSign || '',
                beams: sc.beams?.length ? sc.beams : [{ frontRear: '', sno: 1, beamNo: '', clothMetres: 0, pcs: 0, grossWeight: 0, tareWeight: 0, netWeight: 0, readingMetres: 0, startTime: '', finishTime: '', sizerName: '', backSizer: '', pickUps: 0, vendorName: '', sizingComb: '', sizeBox: '', warpBeam: '', cylinder: '' }],
                shiftDetails: sc.shiftDetails || [],
                materials: sc.materials || [],
            });
        }
    }, [jobCard]);

    // Save warping mutation
    const saveWarping = useMutation({
        mutationFn: async (data: any) => {
            const response = await fetch(`/api/job-cards/${encodeURIComponent(setNo)}/warping`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to save warping details');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job-card', setNo] });
            toast.success('Warping details saved successfully!');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to save warping details');
        },
    });

    // Save sizing mutation
    const saveSizing = useMutation({
        mutationFn: async (data: any) => {
            const response = await fetch(`/api/job-cards/${encodeURIComponent(setNo)}/sizing`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to save sizing details');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job-card', setNo] });
            toast.success('Sizing details saved successfully!');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to save sizing details');
        },
    });

    // Add warping beam row
    const addWarpingBeam = () => {
        setWarpingData(prev => ({
            ...prev,
            beams: [...prev.beams, { sno: prev.beams.length + 1, beamNo: '', metre: 0, ends: 0, grossWeight: 0, tareWeight: 0, netWeight: 0, startTime: '', finishTime: '', rpm: 0, warperName: '', breaks: 0, beamCount: 0 }],
        }));
    };

    // Add sizing beam row
    const addSizingBeam = () => {
        setSizingData(prev => ({
            ...prev,
            beams: [...prev.beams, { frontRear: '', sno: prev.beams.length + 1, beamNo: '', clothMetres: 0, pcs: 0, grossWeight: 0, tareWeight: 0, netWeight: 0, readingMetres: 0, startTime: '', finishTime: '', sizerName: '', backSizer: '', pickUps: 0, vendorName: '', sizingComb: '', sizeBox: '', warpBeam: '', cylinder: '' }],
        }));
    };

    // Add material row
    const addMaterial = () => {
        setSizingData(prev => ({
            ...prev,
            materials: [...prev.materials, { materialName: '', weight: 0 }],
        }));
    };

    // Add shift detail row
    const addShiftDetail = () => {
        setSizingData(prev => ({
            ...prev,
            shiftDetails: [...prev.shiftDetails, { shiftName: '', pavu: 0, mtr: 0, kg: 0 }],
        }));
    };

    if (isLoading) {
        return <div className="container mx-auto p-6">Loading...</div>;
    }

    if (!jobCard) {
        return <div className="container mx-auto p-6">Job Card not found</div>;
    }

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/job-cards">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Job Card: {setNo}</h1>
                        <p className="text-muted-foreground">{jobCard.partyName} | {jobCard.count} | {jobCard.ends} ends</p>
                    </div>
                </div>
                <Badge className={`${jobCard.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {jobCard.status}
                </Badge>
            </div>

            {/* Tabs for Warping and Sizing */}
            <Tabs defaultValue="warping" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="warping" className="flex items-center gap-2">
                        Warping Card (KARL MAYER)
                        {jobCard.warpingCard && <Badge variant="outline" className="ml-2">✓</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="sizing" className="flex items-center gap-2">
                        Sizing Card (ORANGE SIZING UNIT)
                        {jobCard.sizingCard && <Badge variant="outline" className="ml-2">✓</Badge>}
                    </TabsTrigger>
                </TabsList>

                {/* Warping Tab */}
                <TabsContent value="warping">
                    <Card>
                        <CardHeader>
                            <CardTitle>Warping Job Card</CardTitle>
                            <CardDescription>Enter warping details from KARL MAYER machine</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Header Fields */}
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={warpingData.date}
                                        onChange={(e) => setWarpingData(prev => ({ ...prev, date: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Length (Mtrs)</Label>
                                    <Input
                                        type="number"
                                        value={warpingData.lengthInMtrs}
                                        onChange={(e) => setWarpingData(prev => ({ ...prev, lengthInMtrs: e.target.value }))}
                                        placeholder="15800"
                                    />
                                </div>
                                <div>
                                    <Label>M/C No</Label>
                                    <Input
                                        value={warpingData.machineNo}
                                        onChange={(e) => setWarpingData(prev => ({ ...prev, machineNo: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Lot No</Label>
                                    <Input
                                        value={warpingData.lotNo}
                                        onChange={(e) => setWarpingData(prev => ({ ...prev, lotNo: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <Label>Cone Weight (kg)</Label>
                                    <Input
                                        type="number"
                                        value={warpingData.coneWeight}
                                        onChange={(e) => setWarpingData(prev => ({ ...prev, coneWeight: e.target.value }))}
                                        placeholder="3"
                                    />
                                </div>
                                <div>
                                    <Label>Pre Check</Label>
                                    <Input
                                        value={warpingData.preCheck}
                                        onChange={(e) => setWarpingData(prev => ({ ...prev, preCheck: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Total Warp Breaks</Label>
                                    <Input
                                        type="number"
                                        value={warpingData.totalWarpBreaks}
                                        onChange={(e) => setWarpingData(prev => ({ ...prev, totalWarpBreaks: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Breaks / Million Mtrs</Label>
                                    <Input
                                        type="number"
                                        value={warpingData.breaksPerMillion}
                                        onChange={(e) => setWarpingData(prev => ({ ...prev, breaksPerMillion: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {/* Beam Table */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="text-lg">Beam Details</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addWarpingBeam}>
                                        <Plus className="h-4 w-4 mr-1" /> Add Row
                                    </Button>
                                </div>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>S.No</TableHead>
                                                <TableHead>Beam No</TableHead>
                                                <TableHead>Metre</TableHead>
                                                <TableHead>Ends</TableHead>
                                                <TableHead>G.W.T</TableHead>
                                                <TableHead>T.W.T</TableHead>
                                                <TableHead>N.W.T</TableHead>
                                                <TableHead>Start</TableHead>
                                                <TableHead>Finish</TableHead>
                                                <TableHead>RPM</TableHead>
                                                <TableHead>Warper</TableHead>
                                                <TableHead>Breaks</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {warpingData.beams.map((beam, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{beam.sno}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            className="w-20"
                                                            value={beam.beamNo}
                                                            onChange={(e) => {
                                                                const updated = [...warpingData.beams];
                                                                updated[idx].beamNo = e.target.value;
                                                                setWarpingData(prev => ({ ...prev, beams: updated }));
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            className="w-20"
                                                            type="number"
                                                            value={beam.metre || ''}
                                                            onChange={(e) => {
                                                                const updated = [...warpingData.beams];
                                                                updated[idx].metre = parseFloat(e.target.value) || 0;
                                                                setWarpingData(prev => ({ ...prev, beams: updated }));
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            className="w-20"
                                                            type="number"
                                                            value={beam.ends || ''}
                                                            onChange={(e) => {
                                                                const updated = [...warpingData.beams];
                                                                updated[idx].ends = parseInt(e.target.value) || 0;
                                                                setWarpingData(prev => ({ ...prev, beams: updated }));
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            className="w-20"
                                                            type="number"
                                                            value={beam.grossWeight || ''}
                                                            onChange={(e) => {
                                                                const updated = [...warpingData.beams];
                                                                updated[idx].grossWeight = parseFloat(e.target.value) || 0;
                                                                updated[idx].netWeight = updated[idx].grossWeight - updated[idx].tareWeight;
                                                                setWarpingData(prev => ({ ...prev, beams: updated }));
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            className="w-20"
                                                            type="number"
                                                            value={beam.tareWeight || ''}
                                                            onChange={(e) => {
                                                                const updated = [...warpingData.beams];
                                                                updated[idx].tareWeight = parseFloat(e.target.value) || 0;
                                                                updated[idx].netWeight = updated[idx].grossWeight - updated[idx].tareWeight;
                                                                setWarpingData(prev => ({ ...prev, beams: updated }));
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">{beam.netWeight.toFixed(2)}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            className="w-24"
                                                            type="time"
                                                            value={beam.startTime}
                                                            onChange={(e) => {
                                                                const updated = [...warpingData.beams];
                                                                updated[idx].startTime = e.target.value;
                                                                setWarpingData(prev => ({ ...prev, beams: updated }));
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            className="w-24"
                                                            type="time"
                                                            value={beam.finishTime}
                                                            onChange={(e) => {
                                                                const updated = [...warpingData.beams];
                                                                updated[idx].finishTime = e.target.value;
                                                                setWarpingData(prev => ({ ...prev, beams: updated }));
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            className="w-16"
                                                            type="number"
                                                            value={beam.rpm || ''}
                                                            onChange={(e) => {
                                                                const updated = [...warpingData.beams];
                                                                updated[idx].rpm = parseInt(e.target.value) || 0;
                                                                setWarpingData(prev => ({ ...prev, beams: updated }));
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            className="w-24"
                                                            value={beam.warperName}
                                                            onChange={(e) => {
                                                                const updated = [...warpingData.beams];
                                                                updated[idx].warperName = e.target.value;
                                                                setWarpingData(prev => ({ ...prev, beams: updated }));
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            className="w-16"
                                                            type="number"
                                                            value={beam.breaks || ''}
                                                            onChange={(e) => {
                                                                const updated = [...warpingData.beams];
                                                                updated[idx].breaks = parseInt(e.target.value) || 0;
                                                                setWarpingData(prev => ({ ...prev, beams: updated }));
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Summary Fields */}
                            <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                                <div>
                                    <Label>Full Bags Taken</Label>
                                    <Input
                                        type="number"
                                        value={warpingData.fullBagsTaken}
                                        onChange={(e) => setWarpingData(prev => ({ ...prev, fullBagsTaken: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Total Yarn NWT (Kg)</Label>
                                    <Input
                                        type="number"
                                        value={warpingData.totalYarnNWT}
                                        onChange={(e) => setWarpingData(prev => ({ ...prev, totalYarnNWT: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Warp NWT (Kg)</Label>
                                    <Input
                                        type="number"
                                        value={warpingData.warpNWT}
                                        onChange={(e) => setWarpingData(prev => ({ ...prev, warpNWT: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Excess/Shortage (Kg)</Label>
                                    <Input
                                        type="number"
                                        value={warpingData.excessShortage}
                                        onChange={(e) => setWarpingData(prev => ({ ...prev, excessShortage: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Remarks</Label>
                                <Textarea
                                    value={warpingData.remarks}
                                    onChange={(e) => setWarpingData(prev => ({ ...prev, remarks: e.target.value }))}
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline">
                                    <Printer className="h-4 w-4 mr-2" /> Print Warping Card
                                </Button>
                                <Button onClick={() => saveWarping.mutate(warpingData)} disabled={saveWarping.isPending}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {saveWarping.isPending ? 'Saving...' : 'Save Warping Details'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Sizing Tab */}
                <TabsContent value="sizing">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sizing Job Card</CardTitle>
                            <CardDescription>Enter sizing details from ORANGE SIZING UNIT</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Header Fields */}
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={sizingData.date}
                                        onChange={(e) => setSizingData(prev => ({ ...prev, date: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>M/C Name</Label>
                                    <Input
                                        value={sizingData.machineName}
                                        onChange={(e) => setSizingData(prev => ({ ...prev, machineName: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Set Length (Mtrs)</Label>
                                    <Input
                                        type="number"
                                        value={sizingData.setLength}
                                        onChange={(e) => setSizingData(prev => ({ ...prev, setLength: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>No of Beams</Label>
                                    <Input
                                        type="number"
                                        value={sizingData.noOfBeams}
                                        onChange={(e) => setSizingData(prev => ({ ...prev, noOfBeams: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-5 gap-4">
                                <div>
                                    <Label>Mark Wheel</Label>
                                    <Input
                                        value={sizingData.markWheel}
                                        onChange={(e) => setSizingData(prev => ({ ...prev, markWheel: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Mark</Label>
                                    <Input
                                        value={sizingData.mark}
                                        onChange={(e) => setSizingData(prev => ({ ...prev, mark: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Tape Length</Label>
                                    <Input
                                        type="number"
                                        value={sizingData.tapeLength}
                                        onChange={(e) => setSizingData(prev => ({ ...prev, tapeLength: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Beam Width (inch)</Label>
                                    <Input
                                        type="number"
                                        value={sizingData.beamWidth}
                                        onChange={(e) => setSizingData(prev => ({ ...prev, beamWidth: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>RF</Label>
                                    <Input
                                        value={sizingData.rf}
                                        onChange={(e) => setSizingData(prev => ({ ...prev, rf: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-5 gap-4">
                                <div>
                                    <Label>Viscosity</Label>
                                    <Input
                                        type="number"
                                        value={sizingData.viscosity}
                                        onChange={(e) => setSizingData(prev => ({ ...prev, viscosity: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Pick Up</Label>
                                    <Input
                                        type="number"
                                        value={sizingData.pickUp}
                                        onChange={(e) => setSizingData(prev => ({ ...prev, pickUp: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Pick Up %</Label>
                                    <Input
                                        type="number"
                                        value={sizingData.avgPickUpPercent}
                                        onChange={(e) => setSizingData(prev => ({ ...prev, avgPickUpPercent: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Elongation</Label>
                                    <Input
                                        type="number"
                                        value={sizingData.elongation}
                                        onChange={(e) => setSizingData(prev => ({ ...prev, elongation: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Elongation %</Label>
                                    <Input
                                        type="number"
                                        value={sizingData.elongationPercent}
                                        onChange={(e) => setSizingData(prev => ({ ...prev, elongationPercent: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {/* Sizing Beam Table */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="text-lg">Sizing Beam Details</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addSizingBeam}>
                                        <Plus className="h-4 w-4 mr-1" /> Add Row
                                    </Button>
                                </div>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>F/R</TableHead>
                                                <TableHead>S.No</TableHead>
                                                <TableHead>Beam No</TableHead>
                                                <TableHead>Cloth Mtrs</TableHead>
                                                <TableHead>Pcs</TableHead>
                                                <TableHead>G.W.T</TableHead>
                                                <TableHead>T.W.T</TableHead>
                                                <TableHead>N.W.T</TableHead>
                                                <TableHead>Reading Mtrs</TableHead>
                                                <TableHead>Sizer</TableHead>
                                                <TableHead>Pick Ups</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sizingData.beams.map((beam, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>
                                                        <Input
                                                            className="w-12"
                                                            value={beam.frontRear}
                                                            onChange={(e) => {
                                                                const updated = [...sizingData.beams];
                                                                updated[idx].frontRear = e.target.value;
                                                                setSizingData(prev => ({ ...prev, beams: updated }));
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{beam.sno}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            className="w-20"
                                                            value={beam.beamNo}
                                                            onChange={(e) => {
                                                                const updated = [...sizingData.beams];
                                                                updated[idx].beamNo = e.target.value;
                                                                setSizingData(prev => ({ ...prev, beams: updated }));
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            className="w-20"
                                                            type="number"
                                                            value={beam.clothMetres || ''}
                                                            onChange={(e) => {
                                                                const updated = [...sizingData.beams];
                                                                updated[idx].clothMetres = parseFloat(e.target.value) || 0;
                                                                setSizingData(prev => ({ ...prev, beams: updated }));
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            className="w-16"
                                                            type="number"
                                                            value={beam.pcs || ''}
                                                            onChange={(e) => {
                                                                const updated = [...sizingData.beams];
                                                                updated[idx].pcs = parseInt(e.target.value) || 0;
                                                                setSizingData(prev => ({ ...prev, beams: updated }));
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            className="w-20"
                                                            type="number"
                                                            value={beam.grossWeight || ''}
                                                            onChange={(e) => {
                                                                const updated = [...sizingData.beams];
                                                                updated[idx].grossWeight = parseFloat(e.target.value) || 0;
                                                                updated[idx].netWeight = updated[idx].grossWeight - updated[idx].tareWeight;
                                                                setSizingData(prev => ({ ...prev, beams: updated }));
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            className="w-20"
                                                            type="number"
                                                            value={beam.tareWeight || ''}
                                                            onChange={(e) => {
                                                                const updated = [...sizingData.beams];
                                                                updated[idx].tareWeight = parseFloat(e.target.value) || 0;
                                                                updated[idx].netWeight = updated[idx].grossWeight - updated[idx].tareWeight;
                                                                setSizingData(prev => ({ ...prev, beams: updated }));
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">{beam.netWeight?.toFixed(2) || '0.00'}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            className="w-20"
                                                            type="number"
                                                            value={beam.readingMetres || ''}
                                                            onChange={(e) => {
                                                                const updated = [...sizingData.beams];
                                                                updated[idx].readingMetres = parseFloat(e.target.value) || 0;
                                                                setSizingData(prev => ({ ...prev, beams: updated }));
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            className="w-24"
                                                            value={beam.sizerName}
                                                            onChange={(e) => {
                                                                const updated = [...sizingData.beams];
                                                                updated[idx].sizerName = e.target.value;
                                                                setSizingData(prev => ({ ...prev, beams: updated }));
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            className="w-16"
                                                            type="number"
                                                            value={beam.pickUps || ''}
                                                            onChange={(e) => {
                                                                const updated = [...sizingData.beams];
                                                                updated[idx].pickUps = parseFloat(e.target.value) || 0;
                                                                setSizingData(prev => ({ ...prev, beams: updated }));
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Waste Fields */}
                            <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                                <div>
                                    <Label>Front Waste (Kg)</Label>
                                    <Input
                                        type="number"
                                        value={sizingData.frontWaste}
                                        onChange={(e) => setSizingData(prev => ({ ...prev, frontWaste: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Back Waste (Kg)</Label>
                                    <Input
                                        type="number"
                                        value={sizingData.backWaste}
                                        onChange={(e) => setSizingData(prev => ({ ...prev, backWaste: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {/* Materials Section */}
                            <div className="pt-4 border-t">
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="text-lg">Materials Used (Maize, Beans, Binders)</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addMaterial}>
                                        <Plus className="h-4 w-4 mr-1" /> Add Material
                                    </Button>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    {sizingData.materials.map((mat, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <Input
                                                placeholder="Material Name"
                                                value={mat.materialName}
                                                onChange={(e) => {
                                                    const updated = [...sizingData.materials];
                                                    updated[idx].materialName = e.target.value;
                                                    setSizingData(prev => ({ ...prev, materials: updated }));
                                                }}
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Weight"
                                                className="w-24"
                                                value={mat.weight || ''}
                                                onChange={(e) => {
                                                    const updated = [...sizingData.materials];
                                                    updated[idx].weight = parseFloat(e.target.value) || 0;
                                                    setSizingData(prev => ({ ...prev, materials: updated }));
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Shift Details */}
                            <div className="pt-4 border-t">
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="text-lg">Shift Details</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addShiftDetail}>
                                        <Plus className="h-4 w-4 mr-1" /> Add Shift
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Shift</TableHead>
                                            <TableHead>Pavu</TableHead>
                                            <TableHead>Mtr</TableHead>
                                            <TableHead>Kg</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sizingData.shiftDetails.map((shift, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>
                                                    <Input
                                                        value={shift.shiftName}
                                                        onChange={(e) => {
                                                            const updated = [...sizingData.shiftDetails];
                                                            updated[idx].shiftName = e.target.value;
                                                            setSizingData(prev => ({ ...prev, shiftDetails: updated }));
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        value={shift.pavu || ''}
                                                        onChange={(e) => {
                                                            const updated = [...sizingData.shiftDetails];
                                                            updated[idx].pavu = parseFloat(e.target.value) || 0;
                                                            setSizingData(prev => ({ ...prev, shiftDetails: updated }));
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        value={shift.mtr || ''}
                                                        onChange={(e) => {
                                                            const updated = [...sizingData.shiftDetails];
                                                            updated[idx].mtr = parseFloat(e.target.value) || 0;
                                                            setSizingData(prev => ({ ...prev, shiftDetails: updated }));
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        value={shift.kg || ''}
                                                        onChange={(e) => {
                                                            const updated = [...sizingData.shiftDetails];
                                                            updated[idx].kg = parseFloat(e.target.value) || 0;
                                                            setSizingData(prev => ({ ...prev, shiftDetails: updated }));
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Signatures */}
                            <div className="grid grid-cols-6 gap-4 pt-4 border-t">
                                <div>
                                    <Label>Shift Supervisor</Label>
                                    <Input
                                        value={sizingData.shiftSupervisor}
                                        onChange={(e) => setSizingData(prev => ({ ...prev, shiftSupervisor: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Checked By</Label>
                                    <Input
                                        value={sizingData.checkedBy}
                                        onChange={(e) => setSizingData(prev => ({ ...prev, checkedBy: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Manager</Label>
                                    <Input
                                        value={sizingData.manager}
                                        onChange={(e) => setSizingData(prev => ({ ...prev, manager: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Sizer Sign</Label>
                                    <Input
                                        value={sizingData.sizerSign}
                                        onChange={(e) => setSizingData(prev => ({ ...prev, sizerSign: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>M.D Sign</Label>
                                    <Input
                                        value={sizingData.mdSign}
                                        onChange={(e) => setSizingData(prev => ({ ...prev, mdSign: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>F.M Sign</Label>
                                    <Input
                                        value={sizingData.fmSign}
                                        onChange={(e) => setSizingData(prev => ({ ...prev, fmSign: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Remarks</Label>
                                <Textarea
                                    value={sizingData.remarks}
                                    onChange={(e) => setSizingData(prev => ({ ...prev, remarks: e.target.value }))}
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline">
                                    <Printer className="h-4 w-4 mr-2" /> Print Sizing Card
                                </Button>
                                <Button onClick={() => saveSizing.mutate(sizingData)} disabled={saveSizing.isPending}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {saveSizing.isPending ? 'Saving...' : 'Save Sizing Details'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
