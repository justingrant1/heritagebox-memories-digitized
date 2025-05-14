
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import BrevoKeySetup from './BrevoKeySetup';

const AdminSection = () => {
  const [submissions, setSubmissions] = useState<any[]>(
    JSON.parse(localStorage.getItem('form_submissions') || '[]')
  );
  
  const clearSubmissions = () => {
    if (window.confirm('Are you sure you want to clear all stored submissions?')) {
      localStorage.removeItem('form_submissions');
      setSubmissions([]);
      toast.success('All submissions have been cleared');
    }
  };
  
  const refreshSubmissions = () => {
    setSubmissions(JSON.parse(localStorage.getItem('form_submissions') || '[]'));
    toast.success('Submissions refreshed');
  };

  return (
    <section className="py-12 container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <div className="flex gap-2">
          <BrevoKeySetup />
          <Button variant="outline" size="sm" onClick={refreshSubmissions}>
            Refresh Data
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Form Submissions</CardTitle>
              <CardDescription>
                View all form submissions captured from your website
              </CardDescription>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={clearSubmissions}
              className="flex items-center gap-1"
            >
              <Trash2 size={16} />
              <span>Clear All</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Submissions ({submissions.length})</TabsTrigger>
              <TabsTrigger value="newsletter">Newsletter ({submissions.filter(s => s.source === 'newsletter-signup').length})</TabsTrigger>
              <TabsTrigger value="popup">Popup ({submissions.filter(s => s.source === 'welcome-popup').length})</TabsTrigger>
              <TabsTrigger value="contact">Contact ({submissions.filter(s => s.source === 'contact-form').length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {renderSubmissions(submissions)}
            </TabsContent>
            
            <TabsContent value="newsletter" className="mt-4">
              {renderSubmissions(submissions.filter(s => s.source === 'newsletter-signup'))}
            </TabsContent>
            
            <TabsContent value="popup" className="mt-4">
              {renderSubmissions(submissions.filter(s => s.source === 'welcome-popup'))}
            </TabsContent>
            
            <TabsContent value="contact" className="mt-4">
              {renderSubmissions(submissions.filter(s => s.source === 'contact-form'))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
};

// Helper function to render submissions
const renderSubmissions = (submissions: any[]) => {
  if (submissions.length === 0) {
    return <p className="text-gray-500 text-center py-4">No submissions yet</p>;
  }
  
  return (
    <div className="space-y-4">
      {submissions.map((sub, index) => (
        <Card key={index} className={`p-4 ${sub.sent_to_brevo ? 'border-green-200 bg-green-50' : ''} ${sub.error ? 'border-red-200 bg-red-50' : ''}`}>
          <div className="flex justify-between mb-2">
            <div className="font-medium">Submission from {sub.source}</div>
            <div className="text-sm text-gray-500">
              {new Date(sub.timestamp).toLocaleString()}
            </div>
          </div>
          <div className="text-sm">
            {Object.entries(sub.data).map(([key, value]: [string, any]) => (
              <div key={key} className="grid grid-cols-3 gap-2 mb-1">
                <span className="font-medium">{key}:</span>
                <span className="col-span-2">{value}</span>
              </div>
            ))}
          </div>
          {sub.sent_to_brevo && (
            <div className="text-green-600 text-xs mt-2">✓ Sent to Brevo</div>
          )}
          {sub.error && (
            <div className="text-red-600 text-xs mt-2">❌ Error: {sub.error}</div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default AdminSection;
