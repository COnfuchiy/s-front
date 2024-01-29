import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, TouchableOpacity, Alert, Button, Modal, TextInput} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FileUploadModal from "./FileUploadModal";

const WorkspacesScreen = ({route, navigation}) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [pagination, setPagination] = useState({
    total_entities: 0,
    total_pages: 0,
    current_page: 0,
    next_page: 0,
    prev_page: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState({});
  const [isFileUploadModalVisible, setFileUploadModalVisible] = useState(false);
  const {accessToken, refreshToken} = route.params;

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const toggleFileUploadModal = () => {
    setFileUploadModalVisible(!isFileUploadModalVisible);
  };

  const handleAddFileButton = (workspace) => {
    setSelectedWorkspace(workspace)
    toggleFileUploadModal()
  }
  const fetchWorkspaces = async (page = 1) => {
    try {
      const response = await fetch(`http://192.168.31.83:8080/api/v1/user/workspaces?page=${page}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setWorkspaces(data.data);
        setPagination(data.pagination);
      } else {
        Alert.alert('Error', 'Failed to fetch workspaces. Please try again.');
      }
    } catch (error) {
      console.error('Error during fetchWorkspaces:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleWorkspacePress = (workspace) => {
    navigation.navigate('WorkspaceDetail', {accessToken, workspace});
  };

  const handleCreateWorkspace = async () => {
    try {
      const response = await fetch('http://192.168.31.83:8080/api/v1/workspace/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: new URLSearchParams({'name': newWorkspaceName}).toString(),
      });

      if (response.ok) {
        // Refresh the workspace list after creating a new workspace
        fetchWorkspaces();
        setModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to create workspace. Please try again.');
      }
    } catch (error) {
      console.error('Error during handleCreateWorkspace:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  }

  const renderItem = ({item}) => (
    <TouchableOpacity onPress={() => handleWorkspacePress(item)}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
      }}>
        <Text>{item.name}</Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Icon name="user" size={27} color="#48a6ff"/>
          <TouchableOpacity>
            <View style={{marginRight: 8, marginLeft: 8}}>
              <Text>{item.creator.username}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>handleAddFileButton(item)}>
            <View style={{marginRight: 8}}>
              <Icon name="plus" size={27} color="green"/>
            </View>
          </TouchableOpacity>
          <Icon name="trash" size={30} color="red"/>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleNextPage = () => {
    if (pagination.next_page) {
      fetchWorkspaces(pagination.next_page);
    }
  };

  const handlePrevPage = () => {
    if (pagination.prev_page) {
      fetchWorkspaces(pagination.prev_page);
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
      <Button title="Create Workspace" onPress={() => setModalVisible(true)}/>
      <FlatList
        data={workspaces}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
      {renderPagination()}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <View style={{backgroundColor: 'white', padding: 16, borderRadius: 8, width: 300}}>
            <Text>Enter Workspace Name:</Text>
            <TextInput
              value={newWorkspaceName}
              onChangeText={(text) => setNewWorkspaceName(text)}
              placeholder="Workspace Name"
              style={{borderWidth: 1, padding: 8, marginBottom: 16}}
            />
            <View style={{marginBottom: 15}}>
              <Button title="Create" onPress={handleCreateWorkspace}/>
            </View>
            <Button title="Cancel" onPress={() => setModalVisible(false)}/>
          </View>
        </View>
      </Modal>

      <FileUploadModal
        workspace={selectedWorkspace}
        accessToken={accessToken}
        isVisible={isFileUploadModalVisible}
        onClose={toggleFileUploadModal}
        onFileUploaded={()=>{}}
      />

    </View>
  );
};

export default WorkspacesScreen;
