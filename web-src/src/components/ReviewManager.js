import React, { useState, useEffect, useRef, useMemo } from 'react';
import { actionWebInvoke, isShellContext } from '../../utils';
import { isRequiredFieldValid, isRatingValid, isEmailValid } from '../../reviewValidator.js';
import {
  isAuthenticationError,
  handleAuthFailure,
  getAuthHeaders,
  hasAuthContext
} from '../../utils/auth';
import action from '../config.json';
import '../ac-backend-theme.css';
import { extensionId } from './ExtensionRegistration';
import { attach } from '@adobe/uix-guest'

import {
  ProgressCircle,
  TextField,
  NumberField,
  Button,
  ButtonGroup,
  Flex,
  TableView,
  TableHeader,
  TableBody,
  Column,
  Row,
  Cell,
  DialogTrigger,
  AlertDialog,
  MenuTrigger,
  ActionButton,
  Menu,
  Item,
  Picker,
  Text
} from '@adobe/react-spectrum';
import ReviewFormModal from './ReviewFormModal';

const AUTH_REQUIRED_MESSAGE = 'Auth required. Open this app from Commerce Admin or Experience Cloud Shell.';

function ReviewManager(props) {
  console.warn('[ReviewManager] render', {
    hasIms: Boolean(props?.ims),
    imsKeys: props?.ims ? Object.keys(props.ims) : []
  })
  const isShellContextActive = isShellContext()
  const EMPTY_FORM = {
    sku: '',
    rating: null,
    title: '',
    text: '',
    author: '',
    author_email: ''
  };

  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [searchSku, setSearchSku] = useState('');
  const [filterRating, setFilterRating] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterAuthorEmail, setFilterAuthorEmail] = useState('');
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortDescriptor, setSortDescriptor] = useState({ column: null, direction: 'ascending' });
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const selectAllRef = useRef(null);
  const [selectedMassAction, setSelectedMassAction] = useState(''); // new mass action select
  const [notification, setNotification] = useState(null);

  // --- Edit Review State ---
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  // --- New Review Modal State ---
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Default page size
  const pageSizeOptions = [10, 25, 50, 100];

  // Get the connection to the Commerce Admin host
  const [connection, setConnection] = useState(null);
  const hasLoadedRef = useRef(false);
    const authContext = useMemo(() => ({
        ims: props.ims,
        connection
    }), [props.ims, connection]);
    const isAuthAvailable = hasAuthContext(authContext);

    useEffect(() => {
        const fetchCredentials = async () => {
            if (!props?.ims?.token) {
                const guestConnection = await attach({ id: extensionId });
                props.ims.token = guestConnection?.sharedContext?.get('imsToken');
                props.ims.org = guestConnection?.sharedContext?.get('imsOrgId');
                setConnection(guestConnection || null)
            }
            setIsLoading(false);
        };

        fetchCredentials().catch((error) => {
            console.warn('[auth] Failed to attach guest connection', error)
            setIsLoading(false)
        })
    }, []);

// 2. TRIGGER FETCH
    useEffect(() => {
        if (hasAuthContext({ ims: props.ims, connection }) && isLoading) {
            console.log('[ReviewManager] Token verified, starting fetch...');
            fetchReviews(1);
        } else if (isLoading) {
            // This log will help you see the "waiting" period in the console
            console.log('[ReviewManager] Connection established but waiting for IMS token...');
        }
    }, [connection, props.ims, isLoading]); // Re-run when connection or ims changes

    useEffect(() => {
      if (!connection?.sharedContext?.on) {
        return
      }
      const logSharedContextSnapshot = () => {
        if (!connection?.sharedContext?.get || !connection?.sharedContext?.keys) {
          return
        }
        const keys = Array.from(connection.sharedContext.keys())
        const hasIms = Boolean(connection.sharedContext.get('ims'))
        const hasImsToken = Boolean(connection.sharedContext.get('imsToken'))
        const hasImsAccessToken = Boolean(connection.sharedContext.get('imsAccessToken'))
        const hasAccessToken = Boolean(connection.sharedContext.get('accessToken'))
        const hasToken = Boolean(connection.sharedContext.get('token'))
        const hasAuthorization = Boolean(connection.sharedContext.get('authorization'))
        const hasImsOrgId = Boolean(connection.sharedContext.get('imsOrgId'))
        const hasImsOrg = Boolean(connection.sharedContext.get('imsOrg'))
        const hasOrgId = Boolean(connection.sharedContext.get('orgId'))
        const hasOrg = Boolean(connection.sharedContext.get('org'))
        console.info('[auth] sharedContext keys', keys)
        console.info('[auth] sharedContext token flags', {
          hasIms,
          hasImsToken,
          hasImsAccessToken,
          hasAccessToken,
          hasToken,
          hasAuthorization,
          hasImsOrgId,
          hasImsOrg,
          hasOrgId,
          hasOrg
        })
      }
      logSharedContextSnapshot()
      const handleSharedContextChange = () => {
        logSharedContextSnapshot()
      }
      connection.sharedContext.on('change', handleSharedContextChange)
      return () => {
        if (connection?.sharedContext?.off) {
          connection.sharedContext.off('change', handleSharedContextChange)
        }
      }
    }, [connection])

  useEffect(() => {
    if (!isAuthAvailable || hasLoadedRef.current) {
      return
    }
    hasLoadedRef.current = true
    fetchAllReviews(1)
  }, [isAuthAvailable])

  useEffect(() => {
    const headers = getAuthHeaders(authContext)
    console.warn('[ReviewManager] auth snapshot', {
      hasToken: Boolean(headers.authorization),
      imsKeys: props.ims ? Object.keys(props.ims) : [],
      isAuthAvailable
    })
  }, [authContext, props.ims, isAuthAvailable])

  // Defensive setter for reviews
  const setSafeReviews = (data) => {
    if (Array.isArray(data)) {
      setReviews(data);
      setTotalCount(data.length);
    } else if (data && typeof data === 'object' && Array.isArray(data.items)) {
      setReviews(data.items);
      setTotalCount(Number.isFinite(data.total) ? data.total : data.items.length);
    } else if (data && typeof data === 'object' && data.body && Array.isArray(data.body.items)) {
      setReviews(data.body.items);
      setTotalCount(Number.isFinite(data.body.total) ? data.body.total : data.body.items.length);
    } else if (data && typeof data === 'object' && data.body && Array.isArray(data.body)) {
      setReviews(data.body);
      setTotalCount(data.body.length);
    } else if (data && typeof data === 'object' && data.body && data.body.error) {
      setReviews([]);
      setTotalCount(0);
      setError(data.body.error);
      console.error('API error:', data.body.error);
    } else {
      setReviews([]);
      setTotalCount(0);
      setError('Invalid reviews response.');
      console.error('Invalid reviews response:', data);
    }
  };

  const buildListParams = (pageOverride, sortOverride) => {
    const activeSort = sortOverride || sortDescriptor;
    return {
      page: pageOverride || currentPage,
      pageSize,
      sortBy: activeSort.column || 'created_at',
      sortDir: activeSort.direction === 'ascending' ? 'asc' : 'desc'
    };
  };

  // Fetch all reviews
  const fetchAllReviews = async (pageOverride, sortOverride) => {
    const headers = getAuthHeaders(authContext)
    if (!headers.authorization) {
      setIsLoading(false)
      setError(AUTH_REQUIRED_MESSAGE)
      return
    }
    setIsLoading(true);
    try {
      const res = await actionWebInvoke(
        action['review/get-list-reviews'],
        headers,
        buildListParams(pageOverride, sortOverride),
        'post'
      )
      setSafeReviews(res)
    } catch (e) {
      setError(e.message)
    }
    setIsLoading(false)
  };

  // Fetch reviews by SKU only
  const fetchReviews = async (pageOverride, sortOverride) => {
    const headers = getAuthHeaders(authContext)
    if (!headers.authorization) {
      setIsLoading(false);
      setError(AUTH_REQUIRED_MESSAGE);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Only search if at least one field is filled
      if (!searchSku && !selectedStatus && !filterAuthor && !filterAuthorEmail && !filterRating && !filterText) {
        setReviews([]);
        setIsLoading(false);
        return;
      }
      const params = buildListParams(pageOverride, sortOverride);
      if (searchSku) params.sku = searchSku;
      if (selectedStatus) params.status = selectedStatus;
      if (filterAuthor) params.author = filterAuthor;
      if (filterAuthorEmail) params.author_email = filterAuthorEmail;
      if (filterRating) params.rating = filterRating;
      if (filterText) params.text = filterText;
      const res = await actionWebInvoke(action['review/get-list-reviews'], headers, params, 'post');
      setSafeReviews(res);
    } catch (e) {
      setError(e.message || 'Failed to load reviews.');
      setReviews([]);
    }
    setIsLoading(false);
  };

  // Helper to refresh reviews after actions
  const refreshReviews = (pageOverride, sortOverride) => {
    const headers = getAuthHeaders(authContext)
    if (!headers.authorization) {
      setIsLoading(false)
      setError(AUTH_REQUIRED_MESSAGE)
      return
    }
    if (searchSku || selectedStatus || filterAuthor || filterAuthorEmail || filterRating || filterText) {
      fetchReviews(pageOverride, sortOverride);
    } else {
      fetchAllReviews(pageOverride, sortOverride);
    }
  };

  const handleDelete = async (id) => {
    if (!isAuthAvailable) {
      setError(AUTH_REQUIRED_MESSAGE);
      return;
    }
    try {
      // Use delete-reviews-by-id for hard delete
      await actionWebInvoke(action['review/delete-reviews-by-ids'], getAuthHeaders(authContext), { ids: [id] }, 'post');
      notify('success', 'Review deleted.');
      refreshReviews(); // Refresh the list
    } catch (e) {
      if (isAuthenticationError(e) && typeof window !== 'undefined' && window.location) {
        handleAuthFailure(e, setError, window.location.href);
      } else {
        notify('error', 'Failed to delete review.');
        fetchAllReviews(1, sortDescriptor);
      }
    }
  };

  const handleCreateReview = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isAuthAvailable) {
      setError(AUTH_REQUIRED_MESSAGE);
      return;
    }
    setFormError('');
    if (!createForm.sku || createForm.rating == null || createForm.rating < 1 || createForm.rating > 5 || !createForm.title || !createForm.text || !createForm.author || !createForm.author_email) {
      setFormError('All fields are required and rating must be between 1 and 5.');
      return;
    }
    setIsSubmitting(true);
    try {
      await actionWebInvoke(action['review/create-review'], getAuthHeaders(authContext), {
        sku: createForm.sku,
        rating: Number(createForm.rating),
        title: createForm.title,
        text: createForm.text,
        author: createForm.author,
        author_email: createForm.author_email
      }, 'post');
      setCreateForm(EMPTY_FORM);
      setFormError('');
      setCreateTouched({});
      setIsCreateOpen(false); // close modal
      notify('success', 'Review submitted.');
      refreshReviews(1);
    } catch (err) {
      if (isAuthenticationError(err) && typeof window !== 'undefined' && window.location) {
        handleAuthFailure(err, setError, window.location.href);
      } else {
        notify('error', 'Failed to submit review.');
        fetchAllReviews(1, sortDescriptor);
      }
    }
    setIsSubmitting(false);
  };

  // Add handler for updating review status
  const handleUpdateStatus = async (id, status) => {
    if (!isAuthAvailable) {
      setError(AUTH_REQUIRED_MESSAGE);
      return;
    }
    try {
      await actionWebInvoke(action['review/update-reviews'], getAuthHeaders(authContext), { reviews: [{ id, status }] }, 'put');
      notify('success', `Review ${status}.`);
      refreshReviews();
    } catch (e) {
      if (isAuthenticationError(e) && typeof window !== 'undefined' && window.location) {
        handleAuthFailure(e, setError, window.location.href);
      } else {
        notify('error', 'Failed to update review status.');
        fetchAllReviews(1, sortDescriptor);
      }
    }
  };

  // Sorted reviews using Spectrum sortDescriptor
  const sortedReviews = useMemo(() => reviews, [reviews]);

  // Compute paginated reviews
  const paginatedReviews = useMemo(() => sortedReviews, [sortedReviews]);

  // Compute total pages
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const notify = (type, message) => {
    setNotification({ type, message, id: Date.now() });
  };

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  // Listen for configuration changes (user switches org, etc.)
  useEffect(() => {
    const handleConfigChange = ({ imsOrg, imsToken }) => {
      console.info('Configuration change detected:', { imsOrg, imsToken });
      // Refresh data when auth context changes
      fetchAllReviews();
    };

    if (props.runtime && typeof props.runtime.on === 'function') {
      props.runtime.on('configuration', handleConfigChange);
    }

    return () => {
      if (props.runtime && typeof props.runtime.off === 'function') {
        props.runtime.off('configuration', handleConfigChange);
      }
    };
  }, [props.runtime]);

  // Update the indeterminate property of the select-all checkbox
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedIds.length > 0 && selectedIds.length < sortedReviews.length;
    }
  }, [selectedIds, sortedReviews]);

  // Reset to first page when reviews or pageSize changes
  useEffect(() => {
    setCurrentPage(1);
    refreshReviews(1);
  }, [pageSize]);

  // Clear selection when page changes
  useEffect(() => {
    setSelectedIds([]);
  }, [currentPage]);

  // Reset mass action when no items selected
  useEffect(() => {
    if (selectedIds.length === 0 && selectedMassAction) {
      setSelectedMassAction('');
    }
  }, [selectedIds, selectedMassAction]);

  // Connection-driven refresh handled by auth-availability effect

  // Mass action handlers
  const handleMassApprove = async () => {
    await Promise.all(selectedIds.map(id => handleUpdateStatus(id, 'approved')));
    setSelectedIds([]);
  };
  const handleMassReject = async () => {
    await Promise.all(selectedIds.map(id => handleUpdateStatus(id, 'rejected')));
    setSelectedIds([]);
  };
  const handleMassDelete = async () => {
    await Promise.all(selectedIds.map(id => handleDelete(id)));
    setSelectedIds([]);
  };

  // Open edit dialog and prefill form
  const openEditDialog = (review) => {
    setEditingReview(review);
    setEditForm({
      sku: review.sku || '',
      title: review.title || '',
      text: review.text || '',
      rating: review.rating || null,
      author: review.author || '',
      author_email: review.author_email || ''
    });
    setEditTouched({});
  };

  // Close edit dialog
  const closeEditDialog = () => {
    setEditingReview(null);
    setEditForm(EMPTY_FORM);
    setEditTouched({});
    setIsEditSubmitting(false);
  };

  // Handle edit form field change
  // Save edited review
  const handleEditSave = async () => {
    if (!editForm.title || !editForm.text || !editForm.rating || !editForm.author || !editForm.author_email) {
      setError('All fields are required for editing.');
      return;
    }
    if (!isAuthAvailable) {
      setError(AUTH_REQUIRED_MESSAGE);
      return;
    }
    setIsEditSubmitting(true);
    try {
      await actionWebInvoke(action['review/update-reviews'], getAuthHeaders(authContext), {
        reviews: [{
          id: editingReview.id,
          title: editForm.title,
          text: editForm.text,
          rating: Number(editForm.rating),
          author: editForm.author,
          author_email: editForm.author_email
        }]
      }, 'put');
      notify('success', 'Review updated.');
      closeEditDialog();
      refreshReviews();
    } catch (e) {
      if (isAuthenticationError(e) && typeof window !== 'undefined' && window.location) {
        handleAuthFailure(e, setError, window.location.href);
      } else {
        notify('error', 'Failed to update review.');
        fetchAllReviews(1, sortDescriptor);
      }
    }
    setIsEditSubmitting(false);
  };

  // --- Validation helpers (simplified) ---
  const requiredFields = ['sku', 'rating', 'title', 'text', 'author', 'author_email'];
  function validateField(field, value) {
    if (requiredFields.includes(field)) {
      if (!isRequiredFieldValid(value)) {
        return `${field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} is required.`;
      }
    }
    if (field === 'author_email' && value && !isEmailValid(value)) {
      return 'Please enter a valid email address.';
    }
    if (field === 'rating' && !isRatingValid(value)) {
      return 'Rating must be between 1 and 5.';
    }
    return null;
  }

  // New Review Form validation state
  const [createTouched, setCreateTouched] = useState({});
  const [formError, setFormError] = useState('');
  const getValidationState = field => {
    if (!createTouched[field]) return undefined;
    return validateField(field, formValues[field]) ? 'invalid' : 'valid';
  };
  const getErrorMessage = field => {
    if (!createTouched[field]) return undefined;
    return validateField(field, formValues[field]);
  };
  // Centralize form values for new review
  const formValues = createForm;

  // --- Edit Review Dialog validation ---
  const [editTouched, setEditTouched] = useState({});
  const getEditValidationState = field => {
    if (!editTouched[field]) return undefined;
    return validateField(field, editForm[field]) ? 'invalid' : 'valid';
  };
  const getEditErrorMessage = field => {
    if (!editTouched[field]) return undefined;
    return validateField(field, editForm[field]);
  };

  // Compute available statuses from current reviews
  const availableStatuses = useMemo(() => {
    const statusSet = new Set(reviews.map(r => r.status).filter(Boolean));
    return Array.from(statusSet);
  }, [reviews]);

  const hasHeaders = Boolean(getAuthHeaders(authContext).authorization)
  if (!connection && !hasHeaders) {
    return (
      <Flex alignItems="center" justifyContent="center" height="100vh">
        <ProgressCircle aria-label="Connecting to Adobe Commerce..." isIndeterminate />
      </Flex>
    )
  }
  if (!isAuthAvailable) {
    return (
       <Flex alignItems="center" justifyContent="center" height="100vh">
         <div className="ac-content-card" style={{ padding: '20px' }}>
           <Text>{AUTH_REQUIRED_MESSAGE}</Text>
         </div>
       </Flex>
     )
   }

  if (error) {
    let errorMsg = error;
    if (errorMsg && errorMsg.toLowerCase().includes('timeout')) {
      errorMsg = 'The review service is currently unavailable (timeout). Please try again later.';
    }
    return (
        <DialogTrigger isDismissable type="modal">
          <Button variant="secondary">Show Error</Button>
          <AlertDialog
              title="Error"
              variant="error"
              primaryActionLabel="Retry"
              onPrimaryAction={() => {
                setError(null);
                setIsLoading(true);
                if (searchSku) {
                  fetchReviews();
                } else {
                  fetchAllReviews();
                }
              }}
              cancelLabel="Close"
          >
            {errorMsg}
          </AlertDialog>
        </DialogTrigger>
    );
  }

  return (
      <div className="ac-content-card ac-reviews-table" style={{ position: 'relative' }}>
        {/* Loading Overlay */}
        {isLoading && (
            <div className="ac-loading-overlay">
              <ProgressCircle aria-label="Loading…" isIndeterminate size="L" />
            </div>
        )}
        {isShellContextActive && (
          <h2 className="ac-title" style={{ marginBottom: 24 }}>Product Reviews</h2>
        )}

        {/* Submit Review button area (gray background with inset orange button) */}
        <Flex
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          marginBottom="size-200"
          /* remove class from Flex to avoid inline style conflicts */
        >
          <div className="review-submit-area">
            <Button
              variant="secondary"
              onPress={() => setIsCreateOpen(true)}
              aria-label="Submit Review"
              UNSAFE_className="review-submit-button"
            >
              Submit Review
            </Button>
          </div>
        </Flex>

        {notification && (
          <div
            role="status"
            onClick={() => setNotification(null)}
            style={{
              cursor: 'pointer',
              position: 'fixed',
              top: '16px',
              right: '16px',
              zIndex: 9999,
              minWidth: '260px',
              maxWidth: '420px',
              padding: '12px 16px',
              borderRadius: '8px',
              border: `1px solid ${notification.type === 'success' ? '#2d7a46' : '#c9252d'}`,
              backgroundColor: notification.type === 'success' ? '#e6f7ed' : '#fdecea',
              color: notification.type === 'success' ? '#2d7a46' : '#c9252d',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
            }}
          >
            {notification.message}
          </div>
        )}

        {/* Unified background wrapping Filter and Mass Actions toolbars */}
        <Flex direction="column" gap="size-200" marginBottom="size-200">
          {/* Search Toolbar without gray background class */}
          <Flex
            direction="row"
            gap="size-150"
            alignItems="end"
            UNSAFE_style={{
              borderBottom: '1px solid var(--spectrum-global-color-gray-300)',
              paddingBottom: '12px'
            }}
          >
            <TextField label="Search by SKU" value={searchSku} onChange={setSearchSku} width="size-2000" />
            <TextField label="Author" value={filterAuthor} onChange={setFilterAuthor} width="size-1200" />
            <TextField label="Author Email" value={filterAuthorEmail} onChange={setFilterAuthorEmail} width="size-1600" />
            <NumberField label="Rating" minValue={1} maxValue={5} value={filterRating} onChange={setFilterRating} width="size-800" />
            <TextField label="Text" value={filterText} onChange={setFilterText} width="size-2000" />
            <Picker label="Status" selectedKey={selectedStatus} onSelectionChange={setSelectedStatus} width="size-2400" placeholder="All Statuses">
              <Item key="" textValue="All Statuses">All Statuses</Item>
              {availableStatuses && availableStatuses.map(status => (
                <Item key={status} textValue={String(status)}>{status}</Item>
              ))}
            </Picker>
            <Button variant="primary" onPress={() => { setCurrentPage(1); fetchReviews(1); }}>Search</Button>
            <Button variant="secondary" onPress={() => { setSearchSku(''); setFilterAuthor(''); setFilterAuthorEmail(''); setFilterRating(null); setFilterText(''); setSelectedStatus(''); setCurrentPage(1); fetchAllReviews(1); }}>Clear</Button>
          </Flex>

          {/* Mass Actions Toolbar without gray background class */}
          <Flex direction="row" justifyContent="space-between" alignItems="center">
            <Flex direction="row" gap="size-150" alignItems="end" UNSAFE_className="m2-mass-actions-inner">
              <Picker selectedKey={selectedMassAction} onSelectionChange={(key) => {
                if (!key) { setSelectedMassAction(''); return; }
                if (selectedIds.length === 0) { setSelectedMassAction(''); return; }
                setSelectedMassAction(key);
                (async () => {
                  if (key === 'approve') { await handleMassApprove(); }
                  else if (key === 'reject') { await handleMassReject(); }
                  else if (key === 'delete') { await handleMassDelete(); }
                  setSelectedMassAction('');
                })();
              }} width="size-2000" placeholder="Actions">
                <Item key="" textValue="Actions">Actions</Item>
                <Item key="approve" textValue="Approve">Approve</Item>
                <Item key="reject" textValue="Reject">Reject</Item>
                <Item key="delete" textValue="Delete">Delete</Item>
              </Picker>
            <Text>{`${totalCount} records found${selectedIds.length > 0 ? ` (${selectedIds.length} selected)` : ''}`}</Text>
            </Flex>
            <Flex direction="row" gap="size-200" alignItems="center">
              <Picker selectedKey={String(pageSize)} onSelectionChange={key => setPageSize(Number(key))} width="size-1200">
                {pageSizeOptions.map(size => (<Item key={String(size)} textValue={String(size)}>{size}</Item>))}
              </Picker>
              per page
              <ButtonGroup>
                <Button variant="secondary" isDisabled={currentPage === 1} onPress={() => { const nextPage = currentPage - 1; setCurrentPage(nextPage); refreshReviews(nextPage); }}>Previous</Button>
              </ButtonGroup>
              {/* Replace static page number with input */}
              <Text>
                Page{' '}
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  aria-label="Page number"
                  onChange={e => {
                    let val = Number(e.target.value);
                    if (val >= 1 && val <= totalPages) {
                      setCurrentPage(val);
                      refreshReviews(val);
                    }
                  }}
                  onBlur={e => {
                    let val = Number(e.target.value);
                    if (val < 1) val = 1;
                    if (val > totalPages) val = totalPages;
                    setCurrentPage(val);
                    refreshReviews(val);
                  }}
                  style={{ width: '3em', textAlign: 'center', margin: '0 0.3em' }}
                />
                {' '}of {totalPages}
              </Text>
              <ButtonGroup>
                <Button variant="secondary" isDisabled={currentPage === totalPages} onPress={() => { const nextPage = currentPage + 1; setCurrentPage(nextPage); refreshReviews(nextPage); }}>Next</Button>
              </ButtonGroup>
            </Flex>
          </Flex>
        </Flex>

        {/* Reviews Table (original simplified version remains) */}
        <TableView
            aria-label="Product Reviews Table"
            selectionMode="multiple"
            selectedKeys={new Set(selectedIds)}
            onSelectionChange={keys => {
              // Spectrum passes 'all' when select-all is clicked
              if (keys === 'all') {
                setSelectedIds(paginatedReviews.map(r => r.id));
              } else if (keys.size === 0) {
                setSelectedIds([]);
              } else {
                setSelectedIds(Array.from(keys));
              }
            }}
            marginTop="size-200"
            sortDescriptor={sortDescriptor}
            onSortChange={(next) => {
              setSortDescriptor(next);
              setCurrentPage(1);
              refreshReviews(1, next);
            }}
        >
          <TableHeader>
            <Column key="author" allowsSorting showDivider>Author</Column>
            <Column key="author_email" allowsSorting showDivider>Author Email</Column>
            <Column key="sku" allowsSorting showDivider>Product SKU</Column>
            <Column key="rating" allowsSorting showDivider>Rating</Column>
            <Column key="title" allowsSorting showDivider>Title</Column>
            <Column key="text" allowsSorting showDivider>Text</Column>
            <Column key="status" allowsSorting showDivider>Status</Column>
            <Column key="created_at" allowsSorting showDivider>Created At</Column>
            <Column key="updated_at" allowsSorting showDivider>Updated At</Column>
            <Column key="actions" showDivider>Actions</Column>
          </TableHeader>
          <TableBody items={paginatedReviews}>
            {item => (
                <Row key={item.id}>
                  <Cell>{item.author}</Cell>
                  <Cell>{item.author_email}</Cell>
                  <Cell>{item.sku}</Cell>
                  <Cell>{item.rating} / 5</Cell>
                  <Cell>{item.title}</Cell>
                  <Cell>{item.text}</Cell>
                  <Cell>
                    <div className={`status-badge status-${item.status}`}>{item.status}</div>
                  </Cell>
                  <Cell>{item.created_at ? new Date(item.created_at).toLocaleString() : ''}</Cell>
                  <Cell>{item.updated_at ? new Date(item.updated_at).toLocaleString() : ''}</Cell>
                  <Cell>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <MenuTrigger>
                        <ActionButton aria-label="Actions">Actions</ActionButton>
                        <Menu>
                          {item.status !== 'approved' && (
                              <Item key="approve" onAction={() => handleUpdateStatus(item.id, 'approved')} textValue="Approve">Approve</Item>
                          )}
                          {item.status !== 'rejected' && (
                              <Item key="reject" onAction={() => handleUpdateStatus(item.id, 'rejected')} textValue="Reject">Reject</Item>
                          )}
                          <Item key="delete" onAction={() => handleDelete(item.id)} textValue="Delete">Delete</Item>
                          <Item key="edit" onAction={() => openEditDialog(item)} textValue="Edit">Edit</Item>
                        </Menu>
                      </MenuTrigger>
                    </div>
                  </Cell>
                </Row>
            )}
          </TableBody>
        </TableView>
        <ReviewFormModal
          isOpen={!!editingReview}
          onOpenChange={(open) => { if (!open) closeEditDialog(); }}
          mode="edit"
          form={editForm}
          setForm={setEditForm}
          touched={editTouched}
          setTouched={setEditTouched}
          getValidationState={getEditValidationState}
          getErrorMessage={getEditErrorMessage}
          isSubmitting={isEditSubmitting}
          onSubmit={handleEditSave}
          onSaveAndApprove={async () => {
            await handleEditSave();
            if (editingReview) await handleUpdateStatus(editingReview.id, 'approved');
          }}
          onReject={async () => {
            if (editingReview) await handleUpdateStatus(editingReview.id, 'rejected');
            closeEditDialog();
          }}
          resetOnOpen={false}
        />

        <ReviewFormModal
          isOpen={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          mode="create"
          form={createForm}
          setForm={setCreateForm}
          touched={createTouched}
          setTouched={setCreateTouched}
          getValidationState={getValidationState}
          getErrorMessage={getErrorMessage}
          formError={formError}
          setFormError={setFormError}
          isSubmitting={isSubmitting}
          onSubmit={handleCreateReview}
          resetOnOpen={true}
        />
      </div>
  );
}

export default ReviewManager;
