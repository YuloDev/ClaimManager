import { supabase } from '../lib/supabase';

export const documentsService = {
  // Upload document to storage and create database record
  async uploadDocument(claimId, file, documentType, uploadedBy) {
    try {
      // Generate file path: claim-id/document-type/filename
      const fileExt = file?.name?.split('.')?.pop();
      const fileName = `${Date.now()}-${Math.random()?.toString(36)?.substring(2)}.${fileExt}`;
      const filePath = `${claimId}/${documentType}/${fileName}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase?.storage?.from('claim-documents')?.upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Create document record in database
      const { data: documentRecord, error: dbError } = await supabase?.from('claim_documents')?.insert([{
          claim_id: claimId,
          document_type: documentType,
          file_name: file?.name,
          file_path: uploadData?.path,
          file_size: file?.size,
          mime_type: file?.type,
          uploaded_by: uploadedBy
        }])?.select()?.single();

      if (dbError) {
        // Try to cleanup uploaded file if database insert fails
        await supabase?.storage?.from('claim-documents')?.remove([uploadData?.path]);
        throw new Error(`Database error: ${dbError.message}`);
      }

      return documentRecord;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to storage service. Please check your connection.');
      }
      throw error;
    }
  },

  // Get documents for a claim
  async getClaimDocuments(claimId) {
    try {
      const { data, error } = await supabase?.from('claim_documents')?.select(`
          *,
          uploaded_by_user:user_profiles(full_name, role)
        `)?.eq('claim_id', claimId)?.order('uploaded_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  // Get document download URL
  async getDocumentUrl(filePath, expiresIn = 3600) {
    try {
      const { data, error } = await supabase?.storage?.from('claim-documents')?.createSignedUrl(filePath, expiresIn);

      if (error) {
        throw new Error(`Failed to get download URL: ${error.message}`);
      }

      return data?.signedUrl;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to storage service. Please check your connection.');
      }
      throw error;
    }
  },

  // Download document
  async downloadDocument(filePath) {
    try {
      const { data, error } = await supabase?.storage?.from('claim-documents')?.download(filePath);

      if (error) {
        throw new Error(`Download failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to storage service. Please check your connection.');
      }
      throw error;
    }
  },

  // Delete document
  async deleteDocument(documentId) {
    try {
      // First get document details
      const { data: document, error: fetchError } = await supabase?.from('claim_documents')?.select('file_path')?.eq('id', documentId)?.single();

      if (fetchError) {
        throw new Error(`Failed to get document: ${fetchError.message}`);
      }

      // Delete from storage
      const { error: storageError } = await supabase?.storage?.from('claim-documents')?.remove([document?.file_path]);

      if (storageError) {
        throw new Error(`Storage deletion failed: ${storageError.message}`);
      }

      // Delete database record
      const { error: dbError } = await supabase?.from('claim_documents')?.delete()?.eq('id', documentId);

      if (dbError) {
        throw new Error(`Database deletion failed: ${dbError.message}`);
      }

      return { success: true };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to services. Please check your connection.');
      }
      throw error;
    }
  },

  // Validate document
  async validateDocument(documentId, validationData) {
    try {
      const { data, error } = await supabase?.from('claim_documents')?.update({
          is_validated: validationData?.is_validated,
          validation_notes: validationData?.validation_notes || null
        })?.eq('id', documentId)?.select()?.single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  },

  // Get document types for dropdown
  getDocumentTypes() {
    return [
      { value: 'medical_report', label: 'Medical Report' },
      { value: 'invoice', label: 'Invoice/Bill' },
      { value: 'prescription', label: 'Prescription' },
      { value: 'id_document', label: 'ID Document' },
      { value: 'proof_of_payment', label: 'Proof of Payment' },
      { value: 'discharge_summary', label: 'Discharge Summary' },
      { value: 'lab_results', label: 'Lab Results' },
      { value: 'other', label: 'Other' }
    ];
  },

  // Check file validity before upload
  validateFile(file) {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png', 
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes?.includes(file?.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload PDF, JPG, PNG, or Word documents only.'
      };
    }

    if (file?.size > maxSize) {
      return {
        valid: false,
        error: 'File size too large. Maximum allowed size is 10MB.'
      };
    }

    return { valid: true };
  },

  // Get storage usage statistics
  async getStorageStats() {
    try {
      // Get total documents count and size
      const { data: documents, error } = await supabase?.from('claim_documents')?.select('file_size, mime_type, uploaded_at');

      if (error) {
        throw new Error(error.message);
      }

      const stats = {
        total_files: documents?.length || 0,
        total_size: documents?.reduce((sum, doc) => sum + (doc?.file_size || 0), 0) || 0,
        by_type: {},
        recent_uploads: 0
      };

      // Group by file type
      documents?.forEach(doc => {
        const type = doc?.mime_type || 'unknown';
        stats.by_type[type] = (stats?.by_type?.[type] || 0) + 1;
      });

      // Count recent uploads (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo?.setDate(thirtyDaysAgo?.getDate() - 30);
      
      stats.recent_uploads = documents?.filter(doc => 
        new Date(doc.uploaded_at) > thirtyDaysAgo
      )?.length || 0;

      return stats;
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your connection.');
      }
      throw error;
    }
  }
};

export default documentsService;