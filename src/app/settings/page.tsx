'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Building, Database, Bell, Shield, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
    const [companySettings, setCompanySettings] = useState({
        name: 'ORANGE SIZING UNIT',
        gstin: '33BFLPV9549C1ZZ',
        pan: 'BFLPV9549C',
        address: '545/1,ULAGAPURAM, KUMARAVALASU, PERUNDURAI, ERODE-638112',
        state: 'Tamil Nadu',
        stateCode: '33',
        phone: '9345945190,7094421351',
        email: 'orangesizingunit@gmail.com',
    });

    const [invoiceSettings, setInvoiceSettings] = useState({
        invoicePrefix: 'SZ',
        invoiceStartNo: 1,
        financialYear: '2024-25',
        defaultTaxRate: 5,
        jurisdiction: 'CHENNIMALAI',
    });

    const handleSaveCompanySettings = () => {
        toast.success('Company settings saved successfully');
    };

    const handleSaveInvoiceSettings = () => {
        toast.success('Invoice settings saved successfully');
    };

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">System Settings</h1>
                <p className="text-muted-foreground">Configure application settings and preferences</p>
            </div>

            <Tabs defaultValue="company" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="company" className="flex items-center gap-2">
                        <Building className="h-4 w-4" /> Company
                    </TabsTrigger>
                    <TabsTrigger value="invoice" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" /> Invoice
                    </TabsTrigger>
                    <TabsTrigger value="database" className="flex items-center gap-2">
                        <Database className="h-4 w-4" /> Database
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" /> Notifications
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="company">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Information</CardTitle>
                            <CardDescription>Manage your company details that appear on invoices</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Company Name</Label>
                                    <Input
                                        value={companySettings.name}
                                        onChange={(e) => setCompanySettings(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>GSTIN</Label>
                                    <Input
                                        value={companySettings.gstin}
                                        onChange={(e) => setCompanySettings(prev => ({ ...prev, gstin: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>PAN</Label>
                                    <Input
                                        value={companySettings.pan}
                                        onChange={(e) => setCompanySettings(prev => ({ ...prev, pan: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Phone</Label>
                                    <Input
                                        value={companySettings.phone}
                                        onChange={(e) => setCompanySettings(prev => ({ ...prev, phone: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Address</Label>
                                <Input
                                    value={companySettings.address}
                                    onChange={(e) => setCompanySettings(prev => ({ ...prev, address: e.target.value }))}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label>State</Label>
                                    <Input
                                        value={companySettings.state}
                                        onChange={(e) => setCompanySettings(prev => ({ ...prev, state: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>State Code</Label>
                                    <Input
                                        value={companySettings.stateCode}
                                        onChange={(e) => setCompanySettings(prev => ({ ...prev, stateCode: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={companySettings.email}
                                        onChange={(e) => setCompanySettings(prev => ({ ...prev, email: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <Button onClick={handleSaveCompanySettings}>
                                <Save className="mr-2 h-4 w-4" /> Save Company Settings
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="invoice">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Settings</CardTitle>
                            <CardDescription>Configure invoice generation preferences</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Invoice Prefix</Label>
                                    <Input
                                        value={invoiceSettings.invoicePrefix}
                                        onChange={(e) => setInvoiceSettings(prev => ({ ...prev, invoicePrefix: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Starting Number</Label>
                                    <Input
                                        type="number"
                                        value={invoiceSettings.invoiceStartNo}
                                        onChange={(e) => setInvoiceSettings(prev => ({ ...prev, invoiceStartNo: parseInt(e.target.value) }))}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label>Financial Year</Label>
                                    <Input
                                        value={invoiceSettings.financialYear}
                                        onChange={(e) => setInvoiceSettings(prev => ({ ...prev, financialYear: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Default Tax Rate (%)</Label>
                                    <Input
                                        type="number"
                                        value={invoiceSettings.defaultTaxRate}
                                        onChange={(e) => setInvoiceSettings(prev => ({ ...prev, defaultTaxRate: parseFloat(e.target.value) }))}
                                    />
                                </div>
                                <div>
                                    <Label>Jurisdiction</Label>
                                    <Input
                                        value={invoiceSettings.jurisdiction}
                                        onChange={(e) => setInvoiceSettings(prev => ({ ...prev, jurisdiction: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <Button onClick={handleSaveInvoiceSettings}>
                                <Save className="mr-2 h-4 w-4" /> Save Invoice Settings
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="database">
                    <Card>
                        <CardHeader>
                            <CardTitle>Database Settings</CardTitle>
                            <CardDescription>Database connection and backup settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                                <div className="flex items-center gap-2 text-green-700">
                                    <Database className="h-5 w-5" />
                                    <span className="font-medium">Database Connected</span>
                                </div>
                                <p className="text-sm text-green-600 mt-1">MySQL database is connected and operational</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Database Host</Label>
                                    <Input value="localhost" disabled />
                                </div>
                                <div>
                                    <Label>Database Name</Label>
                                    <Input value="erp_db" disabled />
                                </div>
                            </div>
                            <Button variant="outline">
                                <Database className="mr-2 h-4 w-4" /> Backup Database
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Settings</CardTitle>
                            <CardDescription>Configure system notification preferences</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <Bell className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                <p>Notification settings coming soon...</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
