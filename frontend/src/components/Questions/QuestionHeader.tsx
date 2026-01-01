import React, { useState } from 'react';
import { 
  Eye, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Zap,
  ZapOff 
} from 'lucide-react';

interface QuestionHeaderProps {
  onPreview: () => void;  // Now called without parameters
  saving: boolean;
  questionsCount?: number;
  unsavedCount?: number;
  sessionId?: string;
  lastSaved?: string | null;
  autoSaveEnabled?: boolean;
  onToggleAutoSave?: () => void;
  saveError?: string | null;
  hasUnsavedChanges?: boolean;
  // Removed: onSaveAll, onExport, onImport
}

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  onPreview,
  saving,
  questionsCount = 0,
  unsavedCount = 0,
  sessionId,
  lastSaved,
  autoSaveEnabled = false,  // Changed from true to false
  onToggleAutoSave,
  saveError = null,
  hasUnsavedChanges = false,
}) => {
  const [showSaveDetails, setShowSaveDetails] = useState(false);

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const formatDetailedTime = (timestamp: string | null) => {
    if (!timestamp) return 'No saves yet';
    const date = new Date(timestamp);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSaveStatusIcon = () => {
    if (saveError) return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
    if (saving) return <Clock className="w-3.5 h-3.5 text-blue-500 animate-pulse" />;
    if (hasUnsavedChanges) return <Clock className="w-3.5 h-3.5 text-amber-500" />;
    return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;  // Uncommented this line
  };

  const getSaveStatusText = () => {
    if (saveError) return 'Save error';
    if (saving) return 'Saving...';
    if (hasUnsavedChanges) return 'Unsaved changes';
    return 'All saved';  // Added this return
  };

  return (
    <div className="px-0 py-2 rounded-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {sessionId && (
                <>
                  <span className="font-medium">Session:</span>
                  <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">
                    {sessionId.substring(0, 8)}...
                  </span>
                </>
              )}
              
              {/* Save Status with Tooltip */}
              <div 
                className="relative"
                onMouseEnter={() => setShowSaveDetails(true)}
                onMouseLeave={() => setShowSaveDetails(false)}
              >
                <div className="flex items-center gap-1 cursor-help">
                  <div className="flex items-center gap-1">
                    {getSaveStatusIcon()}
                    <span className={`
                      ${saveError ? 'text-red-600' : 
                        saving ? 'text-blue-600' : 
                        hasUnsavedChanges ? 'text-amber-600' : 
                        'text-green-600'}
                    `}>
                      {getSaveStatusText()}
                    </span>
                  </div>
                  
                  {lastSaved && !saving && !hasUnsavedChanges && !saveError && (
                    <span className="text-gray-500">• {formatTime(lastSaved)}</span>
                  )}
                </div>
                
                {/* Save Details Tooltip */}
                {showSaveDetails && (
                  <div className="absolute left-0 top-6 z-50 w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Save Status</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          saveError ? 'bg-red-100 text-red-700' :
                          saving ? 'bg-blue-100 text-blue-700' :
                          hasUnsavedChanges ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {getSaveStatusText()}
                        </span>
                      </div>
                      
                      {lastSaved && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Last Saved</div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDetailedTime(lastSaved)}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Auto-save</div>
                          <div className="text-sm font-medium text-gray-900">
                            {autoSaveEnabled ? 'Enabled' : 'Disabled'}
                          </div>
                        </div>
                        
                        {onToggleAutoSave && (
                          <button
                            onClick={onToggleAutoSave}
                            className={`p-1.5 rounded-lg transition-colors ${
                              autoSaveEnabled 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            title={autoSaveEnabled ? 'Disable auto-save' : 'Enable auto-save'}
                          >
                            {autoSaveEnabled ? (
                              <Zap className="w-4 h-4" />
                            ) : (
                              <ZapOff className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                      
                      {saveError && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded">
                          <div className="text-xs text-red-700 font-medium">Error:</div>
                          <div className="text-xs text-red-600 truncate">{saveError}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Questions Stats */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-gray-100 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                {questionsCount} {questionsCount === 1 ? 'Question' : 'Questions'}
              </span>
            </div>
            
            {unsavedCount > 0 && (
              <div className="px-3 py-1 bg-amber-100 rounded-lg">
                <span className="text-sm font-medium text-amber-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {unsavedCount} draft{unsavedCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Auto-save Toggle (Desktop) */}
          {onToggleAutoSave && (
            <button
              onClick={onToggleAutoSave}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                autoSaveEnabled 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={autoSaveEnabled ? 'Auto-save enabled' : 'Auto-save disabled'}
            >
              {autoSaveEnabled ? (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Auto-save</span>
                </>
              ) : (
                <>
                  <ZapOff className="w-3.5 h-3.5" />
                  <span>Auto-save</span>
                </>
              )}
            </button>
          )}
          
          {/* Preview Button */}
          <button
            onClick={onPreview}
            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>
          
          {/* REMOVED: Save All Button - since we're using per-question saving now */}
          {/* The QuestionBuilderPage handles saving via Next Question button */}
        </div>
      </div>
      
      {/* Mobile Auto-save Toggle */}
      {onToggleAutoSave && (
        <div className="sm:hidden mt-2 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {autoSaveEnabled ? 'Auto-save enabled' : 'Auto-save disabled'}
          </div>
          <button
            onClick={onToggleAutoSave}
            className={`p-1.5 rounded-lg ${
              autoSaveEnabled 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {autoSaveEnabled ? (
              <Zap className="w-4 h-4" />
            ) : (
              <ZapOff className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};