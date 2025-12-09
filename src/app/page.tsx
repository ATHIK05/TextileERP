"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  FileText,
  Plus,
  Download,
  Edit,
  Search,
  RefreshCw,
  Building2,
  Users,
  Package,
  Calculator,
  Truck,
  Settings,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  BarChart3,
  Receipt,
  Layers,
  Home,
  ArrowUpRight,
  Zap
} from "lucide-react";

interface JobCard {
  id: number;
  setNo: string;
  date: string;
  partyName: string;
  count: string;
  ends: number;
  loomType: string;
  status: string;
  totalWeight: number;
  pickupPercentage: number;
  elongationPercentage: number;
}

export default function Dashboard() {
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeNav, setActiveNav] = useState('overview');

  // Mock data - in production, this would fetch from API
  const mockJobCards: JobCard[] = [
    {
      id: 1,
      setNo: '399A',
      date: '2024-09-11',
      partyName: 'SRI VIPIN TEXTILE',
      count: "30's vortex",
      ends: 4800,
      loomType: 'SULZER',
      status: 'Completed',
      totalWeight: 1578.00,
      pickupPercentage: 8.13,
      elongationPercentage: 4.81,
    },
    {
      id: 2,
      setNo: '394A',
      date: '2024-09-10',
      partyName: 'M/S.SRI SHANMUGA TEXTILES',
      count: "30's vortex",
      ends: 4080,
      loomType: 'SULZER',
      status: 'In Progress',
      totalWeight: 1674.70,
      pickupPercentage: 7.50,
      elongationPercentage: 4.20,
    },
  ];

  useEffect(() => {
    setJobCards(mockJobCards);
  }, []);

  // Filter job cards based on search
  const filteredJobCards = jobCards.filter(card =>
    card.setNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.count.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Summary statistics
  const totalJobCards = jobCards.length;
  const completedJobCards = jobCards.filter(card => card.status === 'Completed').length;
  const inProgressJobCards = jobCards.filter(card => card.status === 'In Progress').length;
  const totalWeight = jobCards.reduce((sum, card) => sum + card.totalWeight, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/30">✓ Completed</Badge>;
      case 'In Progress':
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30 hover:bg-blue-500/30">◉ In Progress</Badge>;
      case 'Pending':
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 hover:bg-amber-500/30">○ Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: Home, href: '/' },
    { id: 'companies', label: 'Companies', icon: Building2, href: '/companies' },
    { id: 'parties', label: 'Parties', icon: Users, href: '/parties' },
    { id: 'jobcards', label: 'Job Cards', icon: Calculator, href: '/job-cards' },
    { id: 'invoices', label: 'Invoices', icon: Receipt, href: '/invoices' },
    { id: 'yarn', label: 'Yarn Management', icon: Package, href: '/yarn' },
    { id: 'masters', label: 'Master Data', icon: Layers, href: '/master' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
    { id: 'users', label: 'Users', icon: Users, href: '/users' },
  ];

  const quickActions = [
    { label: 'New Job Card', icon: Plus, href: '/job-cards', color: 'from-orange-500 to-amber-500' },
    { label: 'Create Invoice', icon: FileText, href: '/invoices', color: 'from-blue-500 to-cyan-500' },
    { label: 'Yarn Receipt', icon: Truck, href: '/yarn', color: 'from-emerald-500 to-teal-500' },
    { label: 'Party Setup', icon: Users, href: '/parties', color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="min-h-screen mesh-background">
      {/* Offcanvas Overlay */}
      <div
        className={`offcanvas-overlay ${isOffcanvasOpen ? 'open' : ''}`}
        onClick={() => setIsOffcanvasOpen(false)}
      />

      {/* Offcanvas Sidebar */}
      <aside className={`offcanvas ${isOffcanvasOpen ? 'open' : ''}`}>
        <div className="p-6">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">ORANGE SIZING</h2>
                <p className="text-xs text-muted-foreground">Smart ERP System</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOffcanvasOpen(false)}
              className="hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${activeNav === item.id
                    ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-600 border border-orange-500/30'
                    : 'hover:bg-white/10 text-foreground/80 hover:text-foreground'
                  }`}
                onClick={() => { setActiveNav(item.id); setIsOffcanvasOpen(false); }}
              >
                <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${activeNav === item.id ? 'text-orange-500' : ''}`} />
                <span className="font-medium">{item.label}</span>
                <ChevronRight className={`ml-auto h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0`} />
              </Link>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="glass-card p-4 text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <p className="text-sm font-medium">Pro Version</p>
              <p className="text-xs text-muted-foreground mb-3">Unlock all features</p>
              <Button className="w-full glass-button text-white" size="sm">
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Premium Glass Navbar */}
      <header className="glass-navbar sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Menu & Logo */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOffcanvasOpen(true)}
                className="hover:bg-orange-500/10 transition-colors"
              >
                <Menu className="h-6 w-6" />
              </Button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg pulse-glow">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold gradient-text">ORANGE SIZING UNIT</h1>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3 text-orange-500" />
                    SMART ERP SYSTEM
                  </p>
                </div>
              </div>
            </div>

            {/* Center: Quick Nav Pills */}
            <nav className="hidden lg:flex items-center gap-2">
              {['Dashboard', 'Job Cards', 'Invoices', 'Yarn'].map((item, i) => (
                <Link
                  key={item}
                  href={i === 0 ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                  className={`nav-pill ${i === 0 ? 'active' : ''}`}
                >
                  {item}
                </Link>
              ))}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-48 bg-white/50 border-white/30 focus:bg-white focus:border-orange-500/50 transition-all"
                />
              </div>
              <Button
                className="glass-button text-white gap-2"
                onClick={() => window.location.href = '/job-cards'}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Job Card</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="slide-up mb-8">
          <div className="glass-card p-8 md:p-12 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />

            <div className="relative">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">
                    Welcome back! <span className="wave">👋</span>
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Manage your textile sizing operations with ease
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 border-2 hover:border-orange-500 hover:text-orange-600 transition-all"
                    onClick={() => window.location.href = '/companies'}
                  >
                    <Building2 className="h-5 w-5" />
                    Company Setup
                  </Button>
                  <Button
                    size="lg"
                    className="glass-button text-white gap-2"
                    onClick={() => window.location.href = '/job-cards'}
                  >
                    <Plus className="h-5 w-5" />
                    Create Job Card
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 stagger-children">
          {/* Total Job Cards */}
          <div className="glass-card hover-lift p-6 stats-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-600">+12%</Badge>
            </div>
            <h3 className="text-3xl font-bold mb-1">{totalJobCards}</h3>
            <p className="text-muted-foreground">Total Job Cards</p>
          </div>

          {/* Completed */}
          <div className="glass-card hover-lift p-6 stats-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-600">+8%</Badge>
            </div>
            <h3 className="text-3xl font-bold mb-1">{completedJobCards}</h3>
            <p className="text-muted-foreground">Completed</p>
          </div>

          {/* In Progress */}
          <div className="glass-card hover-lift p-6 stats-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-blue-500/20 text-blue-600">Active</Badge>
            </div>
            <h3 className="text-3xl font-bold mb-1">{inProgressJobCards}</h3>
            <p className="text-muted-foreground">In Progress</p>
          </div>

          {/* Total Weight */}
          <div className="glass-card hover-lift p-6 stats-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-purple-500/20 text-purple-600">KG</Badge>
            </div>
            <h3 className="text-3xl font-bold mb-1">{totalWeight.toFixed(0)}</h3>
            <p className="text-muted-foreground">Total Weight</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <Link
              key={action.label}
              href={action.href}
              className="glass-card hover-lift p-5 group cursor-pointer"
              style={{ animationDelay: `${(index + 5) * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">{action.label}</span>
                <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange-500" />
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Job Cards Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  Recent Job Cards
                </h3>
                <p className="text-sm text-muted-foreground">Latest production activity</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search job cards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-white/50"
                  />
                </div>
                <Button variant="outline" size="icon" className="shrink-0">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  className="glass-button text-white shrink-0"
                  onClick={() => window.location.href = '/job-cards'}
                >
                  View All
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-bold">Set No</TableHead>
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Party</TableHead>
                  <TableHead className="font-bold">Count</TableHead>
                  <TableHead className="font-bold">Ends</TableHead>
                  <TableHead className="font-bold">Loom</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold text-right">Weight</TableHead>
                  <TableHead className="font-bold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobCards.map((jobCard) => (
                  <TableRow
                    key={jobCard.id}
                    className="hover:bg-orange-500/5 transition-colors cursor-pointer group"
                    onClick={() => window.location.href = '/job-cards'}
                  >
                    <TableCell className="font-bold text-orange-600">{jobCard.setNo}</TableCell>
                    <TableCell>{new Date(jobCard.date).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{jobCard.partyName}</TableCell>
                    <TableCell>{jobCard.count}</TableCell>
                    <TableCell>{jobCard.ends.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-500/10">{jobCard.loomType}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(jobCard.status)}</TableCell>
                    <TableCell className="text-right font-semibold">{jobCard.totalWeight.toFixed(2)} kg</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-500/10 hover:text-orange-600">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-500/10 hover:text-blue-600">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredJobCards.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No job cards found</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-navbar mt-16 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-orange-500" />
              <span className="font-semibold">Orange Sizing Unit</span>
              <span className="text-muted-foreground">© 2024</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Smart ERP System</span>
              <span>•</span>
              <span>Production Ready</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-orange-500" />
                Premium Edition
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
