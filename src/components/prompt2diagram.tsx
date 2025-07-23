import React, { useState, useEffect } from 'react';
import { Download, Plus, Edit2, Trash2, Search, Zap, Network, Shield, Server, Cloud, Monitor } from 'lucide-react';

const Prompt2Diagram = () => {
  const [connections, setConnections] = useState([]);
  const [currentConnection, setCurrentConnection] = useState({
    device1: '',
    protocol: '',
    direction: '',
    device2: '',
    port: '',
    media: ''
  });
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [searchTerm1, setSearchTerm1] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [plantUMLCode, setPlantUMLCode] = useState('');
  const [diagramUrl, setDiagramUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const deviceCategories = {
    security: {
      name: 'Security',
      icon: Shield,
      devices: ['Firewall', 'Next-Gen Firewall', 'IDS/IPS', 'WAF', 'VPN Concentrator', 'SIEM', 'Security Gateway', 'DDoS Protection', 'SSL/TLS Terminator', 'Network Access Control']
    },
    network: {
      name: 'Network',
      icon: Network,
      devices: ['Router', 'Layer 3 Switch', 'Layer 2 Switch', 'Load Balancer', 'Wireless Controller', 'Access Point', 'Network Bridge', 'Hub', 'Proxy Server', 'DNS Server', 'DHCP Server']
    },
    servers: {
      name: 'Servers',
      icon: Server,
      devices: ['Web Server', 'Application Server', 'Database Server', 'Domain Controller', 'Mail Server', 'File Server', 'Print Server', 'Backup Server', 'Monitoring Server', 'Authentication Server']
    },
    cloud: {
      name: 'Cloud',
      icon: Cloud,
      devices: ['AWS VPC', 'Azure VNet', 'Google Cloud VPC', 'Cloud Gateway', 'CDN', 'Cloud Load Balancer', 'Cloud Database', 'Cloud Storage', 'Lambda/Functions', 'Kubernetes Cluster']
    },
    endpoints: {
      name: 'Endpoints',
      icon: Monitor,
      devices: ['Workstation', 'Laptop', 'Mobile Device', 'Tablet', 'IoT Device', 'Smart Phone', 'Printer', 'IP Camera', 'VoIP Phone', 'Kiosk']
    }
  };

  const protocols = [
    'HTTP', 'HTTPS', 'SSH', 'FTP', 'SFTP', 'SMTP', 'POP3', 'IMAP', 'DNS', 'DHCP',
    'SNMP', 'LDAP', 'SMB', 'NFS', 'RDP', 'VNC', 'Telnet', 'ICMP', 'TCP', 'UDP',
    'IPSec', 'SSL/TLS', 'VPN', 'BGP', 'OSPF', 'EIGRP'
  ];

  const mediaTypes = ['Ethernet', 'Fiber', 'Wireless', 'Serial', 'T1/E1', 'MPLS'];

  const directions = [
    { value: 'left-right', label: 'Left → Right', arrow: '-->' },
    { value: 'right-left', label: 'Right ← Left', arrow: '<--' },
    { value: 'bidirectional', label: 'Both Ways', arrow: '<-->' }
  ];

  const templates = {
    dmz: {
      name: 'DMZ Architecture',
      description: 'Standard DMZ setup with internal/external firewalls',
      connections: [
        { device1: 'Internet', protocol: 'HTTPS', direction: 'left-right', device2: 'Firewall', port: '443' },
        { device1: 'Firewall', protocol: 'HTTPS', direction: 'left-right', device2: 'Web Server', port: '80' },
        { device1: 'Web Server', protocol: 'SQL', direction: 'left-right', device2: 'Database Server', port: '3306' },
        { device1: 'Firewall', protocol: 'SSH', direction: 'bidirectional', device2: 'Web Server', port: '22' }
      ]
    },
    threeTier: {
      name: 'Three-Tier Architecture',
      description: 'Presentation, Application, and Data layers',
      connections: [
        { device1: 'Load Balancer', protocol: 'HTTPS', direction: 'left-right', device2: 'Web Server', port: '443' },
        { device1: 'Web Server', protocol: 'HTTP', direction: 'left-right', device2: 'Application Server', port: '8080' },
        { device1: 'Application Server', protocol: 'SQL', direction: 'left-right', device2: 'Database Server', port: '5432' },
        { device1: 'Database Server', protocol: 'TCP', direction: 'left-right', device2: 'Backup Server', port: '9000' }
      ]
    },
    zeroTrust: {
      name: 'Zero Trust Network',
      description: 'Never trust, always verify architecture',
      connections: [
        { device1: 'Identity Provider', protocol: 'LDAP', direction: 'bidirectional', device2: 'Authentication Server', port: '389' },
        { device1: 'Authentication Server', protocol: 'HTTPS', direction: 'bidirectional', device2: 'Network Access Control', port: '443' },
        { device1: 'Network Access Control', protocol: 'SSH', direction: 'left-right', device2: 'Application Server', port: '22' },
        { device1: 'SIEM', protocol: 'SNMP', direction: 'left-right', device2: 'Network Access Control', port: '161' }
      ]
    }
  };

  // Get all devices for search
  const getAllDevices = () => {
    let allDevices = [];
    Object.values(deviceCategories).forEach(category => {
      allDevices = [...allDevices, ...category.devices];
    });
    return allDevices;
  };

  // Filter devices based on search
  const getFilteredDevices = (searchTerm) => {
    const allDevices = getAllDevices();
    if (!searchTerm) return allDevices;
    return allDevices.filter(device => 
      device.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // PlantUML encoding function
  const encodePlantUML = (plantUMLText) => {
    try {
      // Convert to UTF-8 bytes
      const encoder = new TextEncoder();
      const bytes = encoder.encode(plantUMLText);
      
      // Convert to base64
      let binary = '';
      bytes.forEach(byte => {
        binary += String.fromCharCode(byte);
      });
      
      return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_');
    } catch (error) {
      console.error('PlantUML encoding error:', error);
      return '';
    }
  };

  // Generate PlantUML code
  const generatePlantUML = () => {
    if (connections.length === 0) return '';

    let umlCode = '@startuml\n';
    umlCode += '!theme plain\n';
    umlCode += 'skinparam backgroundColor white\n';
    umlCode += 'skinparam componentStyle rectangle\n\n';

    // Add all unique devices as components
    const uniqueDevices = [...new Set([
      ...connections.map(conn => conn.device1),
      ...connections.map(conn => conn.device2)
    ])];

    uniqueDevices.forEach(device => {
      const cleanName = device.replace(/[^a-zA-Z0-9]/g, '');
      umlCode += `component "${device}" as ${cleanName}\n`;
    });

    umlCode += '\n';

    // Add connections
    connections.forEach((conn, index) => {
      const device1Clean = conn.device1.replace(/[^a-zA-Z0-9]/g, '');
      const device2Clean = conn.device2.replace(/[^a-zA-Z0-9]/g, '');
      const directionArrow = directions.find(d => d.value === conn.direction)?.arrow || '-->';
      
      const label = conn.protocol + (conn.port ? `:${conn.port}` : '');
      umlCode += `${device1Clean} ${directionArrow} ${device2Clean} : ${label}\n`;
    });

    // Add natural language as note if provided
    if (naturalLanguageInput.trim()) {
      umlCode += `\nnote top : ${naturalLanguageInput}\n`;
    }

    umlCode += '@enduml';
    return umlCode;
  };

  // Generate diagram
  const handleGenerateDiagram = async () => {
    if (connections.length === 0) {
      alert('Please add at least one connection before generating the diagram.');
      return;
    }

    setIsGenerating(true);
    
    try {
      const umlCode = generatePlantUML();
      setPlantUMLCode(umlCode);
      
      const encoded = encodePlantUML(umlCode);
      if (!encoded) {
        throw new Error('Failed to encode PlantUML');
      }
      
      const imageUrl = `https://www.plantuml.com/plantuml/png/${encoded}`;
      setDiagramUrl(imageUrl);

      // Track analytics
      if (window.gtag) {
        window.gtag('event', 'diagram_generated', {
          'connections_count': connections.length
        });
      }
    } catch (error) {
      console.error('Error generating diagram:', error);
      alert('Error generating diagram. Please check your connections and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Export functions
  const exportPNG = () => {
    if (!diagramUrl) {
      alert('Please generate a diagram first.');
      return;
    }
    
    const link = document.createElement('a');
    link.href = diagramUrl;
    link.download = 'network-diagram.png';
    link.click();

    if (window.gtag) {
      window.gtag('event', 'export', { 'export_type': 'PNG' });
    }
  };

  const exportSVG = () => {
    if (!plantUMLCode) {
      alert('Please generate a diagram first.');
      return;
    }

   // Use proper PlantUML encoding with deflate compression
const encoded = btoa(plantUML);
const plantUMLServerUrl = `https://www.plantuml.com/plantuml/svg/~1${encoded}`;
    
    const link = document.createElement('a');
    link.href = svgUrl;
    link.download = 'network-diagram.svg';
    link.click();

    if (window.gtag) {
      window.gtag('event', 'export', { 'export_type': 'SVG' });
    }
  };

  const exportPlantUML = () => {
    if (!plantUMLCode) {
      alert('Please generate a diagram first.');
      return;
    }

    const blob = new Blob([plantUMLCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'network-diagram.puml';
    link.click();
    URL.revokeObjectURL(url);

    if (window.gtag) {
      window.gtag('event', 'export', { 'export_type': 'PlantUML' });
    }
  };

  // Add connection
  const addConnection = () => {
    if (!currentConnection.device1 || !currentConnection.device2 || !currentConnection.protocol || !currentConnection.direction) {
      alert('Please fill in all required fields: Device 1, Device 2, Protocol, and Direction.');
      return;
    }

    if (editingIndex >= 0) {
      const updatedConnections = [...connections];
      updatedConnections[editingIndex] = { ...currentConnection };
      setConnections(updatedConnections);
      setEditingIndex(-1);
    } else {
      setConnections([...connections, { ...currentConnection }]);
    }

    setCurrentConnection({
      device1: '',
      protocol: '',
      direction: '',
      device2: '',
      port: '',
      media: ''
    });
  };

  // Edit connection
  const editConnection = (index) => {
    setCurrentConnection(connections[index]);
    setEditingIndex(index);
  };

  // Delete connection
  const deleteConnection = (index) => {
    const updatedConnections = connections.filter((_, i) => i !== index);
    setConnections(updatedConnections);
  };

  // Load template
  const loadTemplate = (templateKey) => {
    const template = templates[templateKey];
    setConnections([...template.connections]);
    setNaturalLanguageInput(`Template: ${template.name} - ${template.description}`);

    if (window.gtag) {
      window.gtag('event', 'template_loaded', { 'template_name': template.name });
    }
  };

  // Auto-generate diagram when connections change
  useEffect(() => {
    if (connections.length > 0) {
      handleGenerateDiagram();
    } else {
      setDiagramUrl('');
      setPlantUMLCode('');
    }
  }, [connections]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <Network className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Prompt2Diagram</h1>
              <p className="text-sm text-gray-600">Network Architecture Visualization Tool</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Input */}
          <div className="space-y-6">
            {/* Templates */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Quick Start Templates
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(templates).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => loadTemplate(key)}
                    className="text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.description}</div>
                    <div className="text-xs text-blue-600 mt-1">{template.connections.length} connections</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Connection Builder */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Connection</h2>
              
              <div className="space-y-4">
                {/* Device 1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source Device</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search devices..."
                      value={searchTerm1}
                      onChange={(e) => setSearchTerm1(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={currentConnection.device1}
                    onChange={(e) => setCurrentConnection({...currentConnection, device1: e.target.value})}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select source device...</option>
                    {getFilteredDevices(searchTerm1).map(device => (
                      <option key={device} value={device}>{device}</option>
                    ))}
                  </select>
                </div>

                {/* Protocol */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Protocol</label>
                  <select
                    value={currentConnection.protocol}
                    onChange={(e) => setCurrentConnection({...currentConnection, protocol: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select protocol...</option>
                    {protocols.map(protocol => (
                      <option key={protocol} value={protocol}>{protocol}</option>
                    ))}
                  </select>
                </div>

                {/* Direction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Direction</label>
                  <select
                    value={currentConnection.direction}
                    onChange={(e) => setCurrentConnection({...currentConnection, direction: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select direction...</option>
                    {directions.map(direction => (
                      <option key={direction.value} value={direction.value}>{direction.label}</option>
                    ))}
                  </select>
                </div>

                {/* Device 2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destination Device</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search devices..."
                      value={searchTerm2}
                      onChange={(e) => setSearchTerm2(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={currentConnection.device2}
                    onChange={(e) => setCurrentConnection({...currentConnection, device2: e.target.value})}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select destination device...</option>
                    {getFilteredDevices(searchTerm2).map(device => (
                      <option key={device} value={device}>{device}</option>
                    ))}
                  </select>
                </div>

                {/* Optional Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Port (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., 443"
                      value={currentConnection.port}
                      onChange={(e) => setCurrentConnection({...currentConnection, port: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Media (Optional)</label>
                    <select
                      value={currentConnection.media}
                      onChange={(e) => setCurrentConnection({...currentConnection, media: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select media...</option>
                      {mediaTypes.map(media => (
                        <option key={media} value={media}>{media}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={addConnection}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {editingIndex >= 0 ? 'Update Connection' : 'Add Connection'}
                </button>
              </div>
            </div>

            {/* Natural Language Input */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Context (Optional)</h2>
              <textarea
                placeholder="Add any additional context or requirements in natural language..."
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
              />
            </div>

            {/* Connection List */}
            {connections.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Connections ({connections.length})</h2>
                <div className="space-y-2">
                  {connections.map((conn, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {conn.device1} {directions.find(d => d.value === conn.direction)?.arrow} {conn.device2}
                        </div>
                        <div className="text-xs text-gray-600">
                          {conn.protocol}{conn.port ? `:${conn.port}` : ''}{conn.media ? ` via ${conn.media}` : ''}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editConnection(index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteConnection(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Output */}
          <div className="space-y-6">
            {/* Diagram Preview */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Diagram Preview</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={exportPNG}
                    disabled={!diagramUrl}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    PNG
                  </button>
                  <button
                    onClick={exportSVG}
                    disabled={!plantUMLCode}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    SVG
                  </button>
                  <button
                    onClick={exportPlantUML}
                    disabled={!plantUMLCode}
                    className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    PlantUML
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 min-h-64 bg-gray-50 flex items-center justify-center">
                {isGenerating ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <div className="text-gray-600">Generating diagram...</div>
                  </div>
                ) : diagramUrl ? (
                  <img 
                    src={diagramUrl} 
                    alt="Network Diagram" 
                    className="max-w-full h-auto"
                    onError={(e) => {
                      console.error('Image load error:', e);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <Network className="w-16 h-16 mx-auto mb-2 text-gray-300" />
                    <div>Add connections to generate diagram</div>
                  </div>
                )}
                <div style={{display: 'none'}} className="text-center text-red-500">
                  <div>Error loading diagram</div>
                  <div className="text-sm">Please check your connections and try again</div>
                </div>
              </div>
            </div>

            {/* PlantUML Code */}
            {plantUMLCode && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">PlantUML Code</h2>
                <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono overflow-x-auto border">
                  <code>{plantUMLCode}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prompt2Diagram;