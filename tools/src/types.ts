export interface ConfigFieldMetadata {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'color' | 'select' | 'array_string' | 'array_object' | 'object' | 'textarea';
  description?: string;
  options?: string[]; // for select types
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface ConfigGroup {
  name: string;
  description?: string;
  icon?: string;
  fields: ConfigFieldMetadata[];
}

export interface ConfigTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  config: Record<string, any>;
  schema?: ConfigGroup[]; // Optional explicit visual schema
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  line?: number;
}
