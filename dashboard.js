import React, { useState, useCallback } from 'react';
import { Search, Filter, AlertTriangle, CheckCircle, Clock, Map, BarChart2, X, ThumbsUp, ThumbsDown, Plus, Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const incidentCategories = [
  { value: 'flooding', label: 'Flooding' },
  { value: 'fire', label: 'Fire' },
  { value: 'earthquake', label: 'Earthquake' },
  { value: 'storm', label: 'Severe Storm' },
  { value: 'landslide', label: 'Landslide' },
  { value: 'infrastructure', label: 'Infrastructure Damage' },
  { value: 'medical', label: 'Medical Emergency' },
  { value: 'other', label: 'Other' }
];

const NewsItem = ({ info, onVerify, isPending, onVote }) => {
  return (
    <li className="flex items-center justify-between mb-2">
      <span className="mr-2">{info.text}</span>
      <div className="flex items-center">
        <Button size="sm" variant="outline" onClick={() => onVote(info.id, 'up')} className="mr-1">
          <ThumbsUp size={16} />
          <span className="ml-1">{info.upvotes}</span>
        </Button>
        <Button size="sm" variant="outline" onClick={() => onVote(info.id, 'down')} className="mr-1">
          <ThumbsDown size={16} />
          <span className="ml-1">{info.downvotes}</span>
        </Button>
        {isPending && (
          <Button size="sm" onClick={() => onVerify(info.id)}>Verify</Button>
        )}
      </div>
    </li>
  );
};

const MapComponent = ({ incidents }) => {
  return (
    <div className="relative bg-gray-200 h-96 flex items-center justify-center">
      <span className="text-gray-500">Interactive map of Jasper area</span>
      {incidents.map((incident, index) => (
        <div
          key={index}
          className="absolute w-4 h-4 bg-red-500 rounded-full"
          style={{ left: `${incident.x}%`, top: `${incident.y}%` }}
          title={incident.description}
        ></div>
      ))}
    </div>
  );
};

const IncidentReportForm = ({ onSubmit, onCancel }) => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [media, setMedia] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (description && category) {
      onSubmit({ description, category, media });
    } else {
      alert('Please provide a description and select a category.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select onValueChange={setCategory} required>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select incident category" />
        </SelectTrigger>
        <SelectContent>
          {incidentCategories.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea
        placeholder="Describe the incident..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <div className="flex items-center space-x-2">
        <Input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setMedia(e.target.files[0])}
        />
        <Button type="button" onClick={() => document.querySelector('input[type="file"]').click()}>
          <Upload size={20} className="mr-2" />
          Upload Media
        </Button>
      </div>
      {media && <p>File selected: {media.name}</p>}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Submit Report</Button>
      </div>
    </form>
  );
};

const DisasterInfoVerificationUI = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [verifiedInfo, setVerifiedInfo] = useState([
    { id: 1, text: 'Emergency shelters open at City Hall', upvotes: 0, downvotes: 0 },
    { id: 2, text: 'Highway 16 closed due to flooding', upvotes: 0, downvotes: 0 }
  ]);
  const [pendingInfo, setPendingInfo] = useState([
    { id: 3, text: 'Reports of power outages in downtown area', upvotes: 0, downvotes: 0 },
    { id: 4, text: 'Unconfirmed sightings of structural damage', upvotes: 0, downvotes: 0 }
  ]);
  const [incidents, setIncidents] = useState([
    { id: 1, x: 30, y: 40, description: 'Flooding near Athabasca River', category: 'flooding' },
    { id: 2, x: 60, y: 70, description: 'Wildfire spotted in Jasper National Park', category: 'fire' }
  ]);
  const [showReportForm, setShowReportForm] = useState(false);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    console.log(`Searching for: ${searchTerm}`);
    // Implement actual search logic here
  }, [searchTerm]);

  const handleAddFilter = useCallback(() => {
    const newFilter = prompt('Enter a new filter:');
    if (newFilter) setActiveFilters(prev => [...prev, newFilter]);
  }, []);

  const handleRemoveFilter = useCallback((filter) => {
    setActiveFilters(prev => prev.filter(f => f !== filter));
  }, []);

  const handleVerifyInfo = useCallback((id) => {
    setPendingInfo(prev => {
      const infoToVerify = prev.find(info => info.id === id);
      setVerifiedInfo(prevVerified => [...prevVerified, infoToVerify]);
      return prev.filter(info => info.id !== id);
    });
  }, []);

  const handleVote = useCallback((id, voteType, isPending) => {
    const updateVotes = (infoArray) => 
      infoArray.map(info => 
        info.id === id 
          ? { ...info, [voteType === 'up' ? 'upvotes' : 'downvotes']: info[voteType === 'up' ? 'upvotes' : 'downvotes'] + 1 }
          : info
      );

    if (isPending) {
      setPendingInfo(prev => updateVotes(prev));
    } else {
      setVerifiedInfo(prev => updateVotes(prev));
    }
  }, []);

  const handleAddIncident = useCallback(() => {
    setShowReportForm(true);
  }, []);

  const handleSubmitIncident = useCallback((newIncident) => {
    setIncidents(prev => [
      ...prev,
      {
        id: prev.length + 1,
        x: Math.random() * 100,
        y: Math.random() * 100,
        description: newIncident.description,
        category: newIncident.category
      }
    ]);
    setShowReportForm(false);
  }, []);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Disaster Information Verification System</h1>
        <div className="flex items-center space-x-4">
          <img src="/api/placeholder/100/50" alt="Alberta Logo" className="h-10" />
          <img src="/api/placeholder/100/50" alt="University of Alberta Logo" className="h-10" />
          <Button onClick={handleAddIncident} className="bg-red-500 hover:bg-red-600 text-white">
            <Plus size={20} className="mr-2" />
            Report Incident
          </Button>
        </div>
      </header>
      
      <form onSubmit={handleSearch} className="flex mb-4">
        <div className="flex-grow mr-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for disaster-related information..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>
        <Button type="submit">Search</Button>
        <Button type="button" onClick={handleAddFilter} className="ml-2">
          <Filter size={20} className="mr-2" />
          Add Filter
        </Button>
      </form>
      
      {activeFilters.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="px-2 py-1">
              {filter}
              <X size={14} className="ml-2 cursor-pointer" onClick={() => handleRemoveFilter(filter)} />
            </Badge>
          ))}
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 text-red-500" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Evacuation Order</AlertTitle>
              <AlertDescription>
                Immediate evacuation required for Jasper and surrounding areas.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2 text-green-500" />
              Verified Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-none pl-0">
              {verifiedInfo.map((info) => (
                <NewsItem
                  key={info.id}
                  info={info}
                  onVote={(id, voteType) => handleVote(id, voteType, false)}
                  isPending={false}
                />
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 text-yellow-500" />
              Pending Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-none pl-0">
              {pendingInfo.map((info) => (
                <NewsItem
                  key={info.id}
                  info={info}
                  onVerify={handleVerifyInfo}
                  onVote={(id, voteType) => handleVote(id, voteType, true)}
                  isPending={true}
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Map className="mr-2 text-blue-500" />
              Incident Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showReportForm ? (
              <IncidentReportForm
                onSubmit={handleSubmitIncident}
                onCancel={() => setShowReportForm(false)}
              />
            ) : (
              <MapComponent incidents={incidents} />
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart2 className="mr-2 text-purple-500" />
              Incident Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {incidentCategories.map((category) => (
                <li key={category.value} className="flex justify-between items-center">
                  <span>{category.label}</span>
                  <Badge variant="secondary">
                    {incidents.filter(incident => incident.category === category.value).length}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DisasterInfoVerificationUI;
