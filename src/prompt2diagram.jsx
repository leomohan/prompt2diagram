import React, { useState, useCallback } from 'react';
import { Search, Plus, Trash2, Download, FileImage, FileText, Code, Network, Shield, Server, Cloud, Monitor, ChevronDown, Edit3 } from 'lucide-react';

const Prompt2Diagram = () => {
  // Device categories and lists
  const deviceCategories = {
    'Security': ['Firewall', 'IDS/IPS', 'WAF', 'VPN Concentrator', 'SIEM', 'DLP', 'Proxy Server', 'HSM'],
    'Network': ['Router', 'Switch', 'Load Balancer', 'Wireless Controller', 'Access Point', 'Bridge', 'Hub', 'Gateway'],
    'Servers': ['Web Server', 'Database Server', 'Domain Controller', 'Mail Server', 'File Server', 'DNS Server', 'DHCP Server', 'Application Server'],
    'Cloud': ['AWS EC2', 'AWS RDS', 'AWS ALB', 'Azure VM', 'Azure SQL', 'GCP Compute', 'Cloud Gateway', 'CDN'],
    'Endpoints': ['Workstation', 'Mobile Device', 'IoT Device', 'Printer', 'IP Phone', 'Laptop', 'Tablet', 'Smart TV']
  };

  // Communication protocols
  const protocols = [
    'HTTP', 'HTTPS', 'SSH', 'FTP', 'SFTP', 'Telnet', 'SMTP', 'POP3', 'IMAP',
    'DNS', 'DHCP', 'SNMP', 'LDAP', 'LDAPS', 'RDP', 'VNC', 'SQL', 'NFS',
    'SMB/CIFS', 'ICMP', 'TCP', 'UDP', 'TLS', 'IPSec', 'VPN', 'API'
  ];

  // Direction options
  const directions = [
    { value: 'left-right', label: 'Left to Right', symbol: '-->' },
    { value: 'right-left', label: 'Right to Left', symbol: '<--' },
    { value: 'bidirectional', label: 'Bidirectional', symbol: '<-->' }
  ];

  // Templates
  const templates = {
    'DMZ Architecture': [
      { device1: 'Firewall', protocol: 'HTTPS', direction: 'left-right', device2: 'DMZ Switch' },
      { device1: 'DMZ Switch', protocol: 'HTTP', direction: 'left-right', device2: 'Web Server' },
      { device1: 'Web Server', protocol: 'SQL', direction: 'left-right', device2: 'Database Server' }
    ],
    'Three-Tier Architecture': [
      { device1: 'Load Balancer', protocol: 'HTTPS', direction: 'left-right', device2: 'Web Server' },
      { device1: 'Web Server', protocol: 'HTTP', direction: 'left-right', device2: 'Application Server' },
      { device1: 'Application Server', protocol: 'SQL', direction: 'left-right', device2: 'Database Server' }
    ],
    'Zero Trust Network': [
      { device1: 'Workstation', protocol: 'HTTPS', direction: 'left-right', device2: 'Proxy Server' },
      { device1: 'Proxy Server', protocol: 'HTTPS', direction: 'left-right', device2: 'WAF' },
      { device1: 'WAF', protocol: 'HTTP', direction: 'left-right', device2: 'Application Server' }
    ],
    'Cloud Hybrid': [
      { device1: 'Router', protocol: 'VPN', direction: 'left-right', device2: 'Cloud Gateway' },
      { device1: 'Cloud Gateway', protocol: 'HTTPS', direction: 'left-right', device2: 'AWS EC2' },
      { device1: 'AWS EC2', protocol: 'SQL', direction: 'left-right', device2: 'AWS RDS' }
    ],
    'Basic Office Network': [
      { device1: 'Router', protocol: 'TCP', direction: 'left-right', device2: 'Switch' },
      { device1: 'Switch', protocol: 'TCP', direction: 'left-right', device2: 'Workstation' },
      { device1: 'Switch', protocol: 'HTTP', direction: 'left-right', device2: 'File Server' }
    ]
  };

  // State management
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [device1, setDevice1] = useState('');
  const [device2, setDevice2] = useState('');
  const [protocol, setProtocol] = useState('');
  const [direction, setDirection] = useState('left-right');
  const [connections, setConnections] = useState([]);
  const [naturalLanguage, setNaturalLanguage] = useState('');
  const [searchDevice1, setSearchDevice1] = useState('');
  const [searchDevice2, setSearchDevice2] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [generatedPlantUML, setGeneratedPlantUML] = useState('');
  const [diagramUrl, setDiagramUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Get all devices as flat list for search
  const getAllDevices = () => {
    const devices = [];
    Object.values(deviceCategories).forEach(category => {
      devices.push(...category);
    });
    return devices.sort();
  };

  // Filter devices based on search
  const filterDevices = (search) => {
    const allDevices = getAllDevices();
    if (!search) return allDevices;
    return allDevices.filter(device => 
      device.toLowerCase().includes(search.toLowerCase())
    );
  };

  // Add connection
  const addConnection = () => {
    if (!device1 || !device2 || !protocol || !direction) {
      alert('Please select all required fields');
      return;
    }

    const newConnection = { device1, protocol, direction, device2 };
    
    if (editingIndex >= 0) {
      const updatedConnections = [...connections];
      updatedConnections[editingIndex] = newConnection;
      setConnections(updatedConnections);
      setEditingIndex(-1);
    } else {
      setConnections([...connections, newConnection]);
    }

    // Reset form
    setDevice1('');
    setDevice2('');
    setProtocol('');
    setDirection('left-right');
    setSearchDevice1('');
    setSearchDevice2('');
  };

  // Edit connection
  const editConnection = (index) => {
    const conn = connections[index];
    setDevice1(conn.device1);
    setDevice2(conn.device2);
    setProtocol(conn.protocol);
    setDirection(conn.direction);
    setEditingIndex(index);
  };

  // Delete connection
  const deleteConnection = (index) => {
    setConnections(connections.filter((_, i) => i !== index));
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingIndex(-1);
    setDevice1('');
    setDevice2('');
    setProtocol('');
    setDirection('left-right');
    setSearchDevice1('');
    setSearchDevice2('');
  };

  // Load template
  const loadTemplate = (templateName) => {
    if (templateName && templates[templateName]) {
      setConnections(templates[templateName]);
      setSelectedTemplate(templateName);
    }
  };

  // Generate PlantUML
  const generatePlantUML = useCallback(async () => {
    if (connections.length === 0) {
      alert('Please add at least one connection');
      return;
    }

    setIsGenerating(true);

    try {
      let plantUML = '@startuml\n!theme plain\ntitle Network Architecture Diagram\n\n';
      
      // Add connections
      connections.forEach(conn => {
        const arrow = directions.find(d => d.value === conn.direction)?.symbol || '-->';
        const label = conn.protocol ? ` : ${conn.protocol}` : '';
        
        // Clean device names for PlantUML (replace spaces with underscores)
        const cleanDevice1 = conn.device1.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
        const cleanDevice2 = conn.device2.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
        
        plantUML += `[${conn.device1}] as ${cleanDevice1}\n`;
        plantUML += `[${conn.device2}] as ${cleanDevice2}\n`;
        plantUML += `${cleanDevice1} ${arrow} ${cleanDevice2}${label}\n\n`;
      });

      // Add natural language as note if provided
      if (naturalLanguage.trim()) {
        plantUML += `note top : ${naturalLanguage.trim()}\n\n`;
      }

      plantUML += '@enduml';
      
      setGeneratedPlantUML(plantUML);
      
      // Generate diagram URL using PlantUML server
    // Use proper PlantUML encoding with deflate compression
const encoded = btoa(plantUML);
const plantUMLServerUrl = `https://www.plantuml.com/plantuml/svg/~1${encoded}`;
      setDiagramUrl(plantUMLServerUrl);
    } catch (error) {
      console.error('Error generating PlantUML:', error);
      alert('Error generating diagram. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [connections, naturalLanguage]);

  // Export functions
  const exportPNG = async () => {
    if (!diagramUrl) {
      alert('Please generate diagram first');
      return;
    }
    
    try {
      const response = await fetch(diagramUrl.replace('/svg/', '/png/'));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'network-diagram.png';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert('Error exporting PNG. Please try again.');
    }
  };

  const exportSVG = async () => {
    if (!diagramUrl) {
      alert('Please generate diagram first');
      return;
    }
    
    try {
      const response = await fetch(diagramUrl);
      const svgText = await response.text();
      const blob = new Blob([svgText], { type: 'image/svg+xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'network-diagram.svg';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting SVG:', error);
      alert('Error exporting SVG. Please try again.');
    }
  };

  const exportPlantUML = () => {
    if (!generatedPlantUML) {
      alert('Please generate diagram first');
      return;
    }
    
    const blob = new Blob([generatedPlantUML], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'network-diagram.puml';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const DeviceDropdown = ({ value, onChange, searchValue, onSearchChange, placeholder }) => (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Search ${placeholder}...`}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
      </div>
      
      {searchValue && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filterDevices(searchValue).map((device) => (
            <button
              key={device}
              className={`w-full text-left p-3 hover:bg-blue-50 ${value === device ? 'bg-blue-100 text-blue-800' : ''}`}
              onClick={() => {
                onChange(device);
                onSearchChange('');
              }}
            >
              {device}
            </button>
          ))}
        </div>
      )}
      
      {value && !searchValue && (
        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200 text-blue-800 font-medium">
          Selected: {value}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <Network className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Prompt2Diagram</h1>
              <p className="text-gray-600">Convert network descriptions to PlantUML diagrams</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Input */}
          <div className="space-y-6">
            {/* Templates */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Quick Start Templates
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.keys(templates).map(templateName => (
                  <button
                    key={templateName}
                    onClick={() => loadTemplate(templateName)}
                    className={`p-3 text-left rounded-lg border-2 transition-all hover:border-blue-500 hover:bg-blue-50 ${
                      selectedTemplate === templateName ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="font-medium text-gray-800">{templateName}</div>
                    <div className="text-sm text-gray-500">{templates[templateName].length} connections</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Connection Builder */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-green-600" />
                {editingIndex >= 0 ? 'Edit Connection' : 'Add Connection'}
              </h2>
              
              <div className="space-y-4">
                {/* Device 1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source Device
                  </label>
                  <DeviceDropdown
                    value={device1}
                    onChange={setDevice1}
                    searchValue={searchDevice1}
                    onSearchChange={setSearchDevice1}
                    placeholder="source device"
                  />
                </div>

                {/* Protocol */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Protocol
                  </label>
                  <select
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Protocol</option>
                    {protocols.map(proto => (
                      <option key={proto} value={proto}>{proto}</option>
                    ))}
                  </select>
                </div>

                {/* Direction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Direction
                  </label>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {directions.map(dir => (
                      <option key={dir.value} value={dir.value}>{dir.label} ({dir.symbol})</option>
                    ))}
                  </select>
                </div>

                {/* Device 2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Device
                  </label>
                  <DeviceDropdown
                    value={device2}
                    onChange={setDevice2}
                    searchValue={searchDevice2}
                    onSearchChange={setSearchDevice2}
                    placeholder="target device"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={addConnection}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {editingIndex >= 0 ? 'Update Connection' : 'Add Connection'}
                  </button>
                  {editingIndex >= 0 && (
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Natural Language Input */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Edit3 className="w-5 h-5 mr-2 text-purple-600" />
                Additional Context (Optional)
              </h2>
              <textarea
                value={naturalLanguage}
                onChange={(e) => setNaturalLanguage(e.target.value)}
                placeholder="Describe additional network details, security requirements, or architectural notes..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
              />
            </div>
          </div>

          {/* Right Panel - Connections & Diagram */}
          <div className="space-y-6">
            {/* Connections List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Network className="w-5 h-5 mr-2 text-indigo-600" />
                Connections ({connections.length})
              </h2>
              
              {connections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Network className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No connections added yet</p>
                  <p className="text-sm">Use the form on the left or select a template to get started</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {connections.map((conn, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg border ${editingIndex === index ? 'border-blue-500 bg-blue-50' : ''}`}>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {conn.device1} → {conn.device2}
                        </div>
                        <div className="text-sm text-gray-600">
                          {conn.protocol} • {directions.find(d => d.value === conn.direction)?.label}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editConnection(index)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteConnection(index)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Generate & Export */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Download className="w-5 h-5 mr-2 text-green-600" />
                Generate & Export
              </h2>
              
              <button
                onClick={generatePlantUML}
                disabled={isGenerating || connections.length === 0}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium mb-4 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Network className="w-5 h-5 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Diagram'}
              </button>

              {diagramUrl && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={exportPNG}
                      className="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <FileImage className="w-4 h-4 mr-2" />
                      Export PNG
                    </button>
                    <button
                      onClick={exportSVG}
                      className="flex items-center justify-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      <FileImage className="w-4 h-4 mr-2" />
                      Export SVG
                    </button>
                    <button
                      onClick={exportPlantUML}
                      className="flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Export .puml
                    </button>
                  </div>
                  
                  {/* Generated PlantUML Code Preview */}
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Generated PlantUML Code:</h3>
                    <div className="bg-gray-100 rounded-lg p-3 max-h-32 overflow-y-auto">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">{generatedPlantUML}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Diagram Preview */}
            {diagramUrl && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Monitor className="w-5 h-5 mr-2 text-blue-600" />
                  Diagram Preview
                </h2>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <img 
                    src={diagramUrl} 
                    alt="Generated Network Diagram" 
                    className="max-w-full h-auto mx-auto"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'block';
                    }}
                  />
                  <div className="hidden text-center text-gray-500 py-8">
                    <Monitor className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Unable to load diagram preview</p>
                    <p className="text-sm">You can still export the PlantUML file</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prompt2Diagram;