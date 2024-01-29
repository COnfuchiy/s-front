import React, {useState, useRef} from 'react';
import {View, Text, Modal, TextInput, Button, Alert} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import {log} from "expo/build/devtools/logger";

const FileUploadModal = ({workspace, accessToken, isVisible, onClose, onFileUploaded}) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync();
      if (!result.canceled) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert('Error', 'Failed to pick a file. Please try again.');
      }
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file before uploading.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.mimeType,
        name: selectedFile.name,
      });

      formData.append('filename', selectedFile.name)
      formData.append('size', selectedFile.size)

      const response = await fetch(`http://192.168.31.83:8080/api/v1/workspace/${workspace.id}/file/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        onFileUploaded();
        onClose();
        Alert.alert('Success', 'File uploaded successfully!');
      } else {
        Alert.alert('Error', 'Failed to upload file. Please try again.');
      }
    } catch (error) {
      console.error('Error during handleUploadFile:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => onClose()}
    >
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <View style={{backgroundColor: 'white', padding: 16, borderRadius: 8, width: 300}}>
          <Text>Select a File to Upload:</Text>
          <TextInput
            style={{borderWidth: 1, padding: 8, marginBottom: 16}}
            placeholder="Selected File"
            value={selectedFile ? selectedFile.name : ''}
            editable={false}
            ref={fileInputRef}
          />
          <View style={{marginBottom: 15}}>
            <Button title="Choose File" onPress={handleFilePick}/>
          </View>
          <View style={{marginBottom: 15}}>
            <Button title="Upload File" onPress={handleUploadFile} disabled={isLoading} />
            {isLoading && <Text>Uploading...</Text>}
          </View>
          <View>
            <Button title="Cancel" onPress={() => onClose()}/>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FileUploadModal;
