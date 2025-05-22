'use client';

import { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SmtpConfig = {
  id: string;
  server: string;
  port: number | '';
  security: 'none' | 'SSL' | 'TLS';
  username: string;
  password: string;
  senderEmail: string;
  senderName: string;
  errors?: {
    server?: string;
    port?: string;
  };

};

const initialConfig: SmtpConfig = {
  id: Date.now().toString(), // Simple unique ID for now
  server: '',
  port: '',
  security: 'none',
  username: '',
  password: '',
  senderEmail: '',
  senderName: '',
  errors: {},
};

export default function SmtpSettingsPage() {
  const [smtpConfigs, setSmtpConfigs] = useState<SmtpConfig[]>([initialConfig]);

  const handleInputChange = (id: string, field: keyof SmtpConfig, value: string | number | 'none' | 'SSL' | 'TLS') => {
    setSmtpConfigs(smtpConfigs.map(config =>
      config.id === id ? { ...config, [field]: value } : config
    ));
  };

  const handleAddConfig = () => {
    setSmtpConfigs([...smtpConfigs, { ...initialConfig, id: Date.now().toString() }]);
  };

  const handleRemoveConfig = (id: string) => {
    if (smtpConfigs.length > 1) {
      setSmtpConfigs(smtpConfigs.filter(config => config.id !== id));
    }
  };

  const handleSave = () => {
    const newConfigsWithValidation = smtpConfigs.map(config => {
      const errors: SmtpConfig['errors'] = {};
      if (!config.server) {
        errors.server = 'Server is required';
      }
      if (!config.port) {
        errors.port = 'Port is required';
      }
      return { ...config, errors };
    });

    setSmtpConfigs(newConfigsWithValidation);

    const hasErrors = newConfigsWithValidation.some(config => Object.keys(config.errors || {}).length > 0);

    if (!hasErrors) {
      console.log('Saving SMTP configurations:', newConfigsWithValidation);
    } else {
      console.log('Validation errors:', newConfigsWithValidation);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">SMTP Settings</h1>

      {smtpConfigs.map(config => (
        <div key={config.id} className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Configuration {smtpConfigs.indexOf(config) + 1}</h2>
            {smtpConfigs.length > 1 && (
              <Button variant="destructive" size="icon" onClick={() => handleRemoveConfig(config.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`server-${config.id}`}>SMTP Server</Label>
              <Input
                id={`server-${config.id}`}
                value={config.server}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(config.id, 'server', e.target.value)}
                placeholder="smtp.example.com"
              />
              {config.errors?.server && <p className="text-red-500 text-sm mt-1">{config.errors.server}</p>}
            </div>
            <div>
              <Label htmlFor={`port-${config.id}`}>Port</Label>
              <Input
                id={`port-${config.id}`}
                type="number"
                value={config.port}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(config.id, 'port', parseInt(e.target.value) || '')}
                placeholder="587"
              />
              {config.errors?.port && <p className="text-red-500 text-sm mt-1">{config.errors.port}</p>}
            </div>
            <div>
              <Label htmlFor={`security-${config.id}`}>Security</Label>
              <Select
                value={config.security}
                onValueChange={(value: 'none' | 'SSL' | 'TLS') => handleInputChange(config.id, 'security', value)}
              >
                <SelectTrigger id={`security-${config.id}`}>
                  <SelectValue placeholder="Select security type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="SSL">SSL</SelectItem>
                  <SelectItem value="TLS">TLS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`username-${config.id}`}>Username</Label>
              <Input
                id={`username-${config.id}`}
                value={config.username}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(config.id, 'username', e.target.value)}
                placeholder="your-email@example.com"
              />
            </div>
            <div>
              <Label htmlFor={`password-${config.id}`}>Password</Label>
              <Input
                id={`password-${config.id}`}
                type="password"
                value={config.password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(config.id, 'password', e.target.value)}
                placeholder="Your SMTP password"
              />
            </div>
            <div>
              <Label htmlFor={`senderEmail-${config.id}`}>Sender Email</Label>
              <Input
                id={`senderEmail-${config.id}`}
                value={config.senderEmail}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(config.id, 'senderEmail', e.target.value)}
                placeholder="sender@example.com"
              />
            </div>
            <div>
              <Label htmlFor={`senderName-${config.id}`}>Sender Name</Label>
              <Input
                id={`senderName-${config.id}`}
                value={config.senderName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(config.id, 'senderName', e.target.value)}
                placeholder="Your Company Name"
              />
            </div>
          </div>
        </div>
      ))}

      <div className="flex gap-4 mt-6">
        <Button onClick={handleAddConfig}>Add Configuration</Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}