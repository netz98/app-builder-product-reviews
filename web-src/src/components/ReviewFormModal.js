import React from 'react';
import {
  DialogTrigger,
  Dialog,
  Heading,
  Content,
  Form,
  TextField,
  NumberField,
  Button,
  ButtonGroup,
  Text
} from '@adobe/react-spectrum';

const emptyForm = {
  sku: '',
  rating: null,
  title: '',
  text: '',
  author: '',
  author_email: ''
};

export default function ReviewFormModal({
  isOpen,
  onOpenChange,
  mode,
  form,
  setForm,
  touched,
  setTouched,
  getValidationState,
  getErrorMessage,
  formError,
  setFormError,
  isSubmitting,
  onSubmit,
  onSaveAndApprove,
  onReject,
  resetOnOpen
}) {
  const isEdit = mode === 'edit';
  const heading = isEdit ? 'Edit Review' : 'Create a New Review';

  return (
    <DialogTrigger
      isOpen={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (resetOnOpen) {
          if (open) {
            setForm(emptyForm);
            setTouched({});
            if (setFormError) setFormError('');
          } else {
            setTouched({});
            setForm(emptyForm);
            if (setFormError) setFormError('');
          }
        }
      }}
      type="modal"
    >
      <React.Fragment />
      <Dialog style={{ maxWidth: 520 }}>
        <Heading>{heading}</Heading>
        <Content>
          <Form onSubmit={onSubmit} autoComplete="off" width="100%" maxWidth="480px">
            <TextField
              label="SKU"
              value={form.sku}
              onChange={(value) => {
                setForm(prev => ({ ...prev, sku: value }));
                setTouched(t => ({ ...t, sku: true }));
              }}
              isRequired
              isReadOnly={isEdit}
              validationState={getValidationState('sku')}
              errorMessage={getErrorMessage('sku')}
              width="100%"
            />
            <NumberField
              label="Rating (1-5)"
              minValue={1}
              maxValue={5}
              value={form.rating}
              onChange={(value) => {
                setForm(prev => ({ ...prev, rating: value }));
                setTouched(t => ({ ...t, rating: true }));
              }}
              isRequired
              validationState={getValidationState('rating')}
              errorMessage={getErrorMessage('rating')}
              width="100%"
            />
            <TextField
              label="Title"
              value={form.title}
              onChange={(value) => {
                setForm(prev => ({ ...prev, title: value }));
                setTouched(t => ({ ...t, title: true }));
              }}
              isRequired
              validationState={getValidationState('title')}
              errorMessage={getErrorMessage('title')}
              width="100%"
            />
            <TextField
              label="Text"
              value={form.text}
              onChange={(value) => {
                setForm(prev => ({ ...prev, text: value }));
                setTouched(t => ({ ...t, text: true }));
              }}
              isRequired
              validationState={getValidationState('text')}
              errorMessage={getErrorMessage('text')}
              width="100%"
            />
            <TextField
              label="Author"
              value={form.author}
              onChange={(value) => {
                setForm(prev => ({ ...prev, author: value }));
                setTouched(t => ({ ...t, author: true }));
              }}
              isRequired
              validationState={getValidationState('author')}
              errorMessage={getErrorMessage('author')}
              width="100%"
            />
            <TextField
              label="Author Email"
              value={form.author_email}
              onChange={(value) => {
                setForm(prev => ({ ...prev, author_email: value }));
                setTouched(t => ({ ...t, author_email: true }));
              }}
              isRequired
              type="email"
              validationState={getValidationState('author_email')}
              errorMessage={getErrorMessage('author_email')}
              width="100%"
            />
            {formError && <Text UNSAFE_className="form-error-text" role="alert">{formError}</Text>}
            <ButtonGroup align="end" marginTop="size-300">
              {isEdit ? (
                <>
                  <Button variant="primary" onPress={onSubmit} isDisabled={isSubmitting}>Save</Button>
                  <Button variant="cta" onPress={onSaveAndApprove} isDisabled={isSubmitting}>Save and Approve</Button>
                  <Button variant="negative" onPress={onReject} isDisabled={isSubmitting}>Reject</Button>
                  <Button variant="secondary" onPress={() => onOpenChange(false)} isDisabled={isSubmitting}>Cancel</Button>
                </>
              ) : (
                <>
                  <Button variant="primary" type="submit" isDisabled={isSubmitting}>Submit Review</Button>
                  <Button variant="secondary" onPress={() => onOpenChange(false)} isDisabled={isSubmitting}>Cancel</Button>
                </>
              )}
            </ButtonGroup>
          </Form>
        </Content>
      </Dialog>
    </DialogTrigger>
  );
}
