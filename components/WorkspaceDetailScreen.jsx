import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  Button,
  TextInput,
  Modal,
  TouchableOpacity,
  Touchable,
  Linking
} from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome";
import FileUploadModal from "./FileUploadModal";

function niceBytes(a) {
  let b = 0, c = parseInt(a, 10) || 0;
  for (; 1000 <= c && ++b;) c /= 1000;
  return c.toFixed(10 > c && 0 < b ? 1 : 0) + " " + ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][b]
}

const WorkspaceDetailScreen = ({ route}) => {
  const [fileHistories, setFileHistories] = useState([]);
  const [selectedFileHistory, setSelectedFileHistory] = useState({});
  const [downloadLink, setDownloadLink] = useState(null);
  const [isFileHistoryModalVisible, setFileHistoryModalVisible] = useState(false);
  const [isDownloadLinkModalVisible, setDownloadLinkModalVisible] = useState(false);
  const [isFileUploadModalVisible, setFileUploadModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    total_entities: 0,
    total_pages: 0,
    current_page: 0,
    next_page: 0,
    prev_page: 0,
  });
  const {accessToken, workspace} = route.params;


  useEffect(() => {
    fetchFileHistories();
  }, []);

  const toggleFileUploadModal = () => {
    setFileUploadModalVisible(!isFileUploadModalVisible);
  };

  const handleFileUploaded = () => {
    fetchFileHistories(pagination.current_page !== 0 ? pagination.current_page : 1);
  }

  const fetchFileHistories = async (page = 1) => {
    try {
      const response = await fetch(`http://192.168.31.83:8080/api/v1/workspace/${workspace.id}/file-histories?page=${page}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setFileHistories(data.file_histories);
        setPagination(data.pagination);
      } else {
        Alert.alert('Error', 'Failed to fetch file histories. Please try again.');
      }
    } catch (error) {
      console.error('Error during fetchFileHistories:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleNextPage = () => {
    if (pagination.next_page) {
      fetchFileHistories(pagination.next_page);
    }
  };

  const handlePrevPage = () => {
    if (pagination.prev_page) {
      fetchFileHistories(pagination.prev_page);
    }
  };

  const handleFileHistoryPress = (fileHistory) => {
    setSelectedFileHistory(fileHistory);
    setFileHistoryModalVisible(true);
  };

  const renderFileHistoryModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isFileHistoryModalVisible}
      onRequestClose={() => setFileHistoryModalVisible(false)}
    >
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <View style={{backgroundColor: 'white', padding: 16, borderRadius: 8, width: 300}}>
          <FlatList
            data={selectedFileHistory.files ? selectedFileHistory.files : []}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({item}) => (
              <TouchableOpacity onPress={() => handleDownloadLinkPress(item)}>
                <View style={{padding: 8}}>
                  <Text>Version Creation Date: {item.created_at}</Text>
                  <Text>Size: {niceBytes(item.size)}</Text>
                  <Icon name="download" size={30} color="green"/>
                </View>
              </TouchableOpacity>
            )}
          />
          <Button title="Close" onPress={() => setFileHistoryModalVisible(false)}/>
        </View>
      </View>
    </Modal>
  );

  const handleDownloadLinkPress = async (file) => {
    try {
      const response = await fetch(`http://192.168.31.83:8080/api/v1/workspace/${workspace.id}/file/${file.id}/get-file-download-link`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setDownloadLink(data.download_link);
        setDownloadLinkModalVisible(true);
      } else {
        Alert.alert('Error', 'Failed to get download link. Please try again.');
      }
    } catch (error) {
      console.error('Error during handleDownloadLinkPress:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const renderDownloadLinkModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isDownloadLinkModalVisible}
      onRequestClose={() => setDownloadLinkModalVisible(false)}
    >
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <View style={{backgroundColor: 'white', padding: 16, borderRadius: 8, width: 300}}>
          <Text>Download Link:</Text>
          <Text style={{color: 'blue'}}
                onPress={() => Linking.openURL('downloadLink')}>
            {downloadLink}
          </Text>
          <Button title="Close" onPress={() => setDownloadLinkModalVisible(false)}/>
        </View>
      </View>
    </Modal>
  );
  const renderFileItem = ({item}) => {
    if (item.files) {
      const mostRecentFile = item.files.reduce((prevFile, currentFile) => {
        return new Date(currentFile.created_at) > new Date(prevFile.created_at) ? currentFile : prevFile;
      }, item.files[0]);


      return (
        <View style={{padding: 16, borderBottomWidth: 1, borderBottomColor: '#ddd'}}>
          <Text>{mostRecentFile.filename}</Text>
          <Text>Tag: {mostRecentFile.tag}</Text>
          <Text>Size: {niceBytes(mostRecentFile.size)}</Text>
          <Text>Changed at: {mostRecentFile.created_at}</Text>
          <View style={{marginBottom: 15}}>
            <Button title={"Download"} onPress={() => handleDownloadLinkPress(mostRecentFile)}></Button>
          </View>
          <View>
            <Button onPress={() => handleFileHistoryPress(item)} title="View all version"/>
          </View>
        </View>
      );
    }
  };

  const renderPagination = () => (
    <View style={{flexDirection: 'row', justifyContent: 'space-between', padding: 16}}>
      <Button title="<" onPress={handlePrevPage} disabled={!pagination.prev_page}/>
      <Text>{`Page ${pagination.current_page} of ${pagination.total_pages}`}</Text>
      <Button title=">" onPress={handleNextPage} disabled={!pagination.next_page}/>
    </View>
  );

  return (
    <View>
      <Button title="Upload file" onPress={toggleFileUploadModal}/>
      <FlatList
        data={fileHistories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFileItem}
      />
      {renderPagination()}
      {renderFileHistoryModal()}
      {renderDownloadLinkModal()}
      <FileUploadModal
        workspace={workspace} // Pass the workspace object
        accessToken={accessToken}
        isVisible={isFileUploadModalVisible}
        onClose={toggleFileUploadModal}
        onFileUploaded={handleFileUploaded} // Define a function to handle file upload success
      />
    </View>
  );
};

export default WorkspaceDetailScreen;
