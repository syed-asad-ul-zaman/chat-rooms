document.addEventListener('DOMContentLoaded', function () {
    const currentUser = 'syed-asad-ul-zaman';
    let rooms = JSON.parse(localStorage.getItem('chatRooms')) || [];

    window.closeModal = function () {
        const modal = document.getElementById('editRoomModal');

        if (!modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }

        if (modal.classList.contains('flex')) {
            modal.classList.remove('flex');
        }

        document.body.classList.remove('overflow-hidden');
    };

    window.openModal = function () {
        const modal = document.getElementById('editRoomModal');

        if (modal.classList.contains('hidden')) {
            modal.classList.remove('hidden');
        }

        if (!modal.classList.contains('flex')) {
            modal.classList.add('flex');
        }

        document.body.classList.add('overflow-hidden');
    };

    window.joinRoom = function (roomId) {
        const room = rooms.find(r => r.id === roomId);
        if (room) {
            alert(`Joining room "${room.name}". This would navigate to the room view in a real implementation.`);
        }
    };

    document.getElementById('create-room-btn').addEventListener('click', function () {
        const roomNameInput = document.getElementById('room-name');
        const roomName = roomNameInput.value.trim();

        if (!roomName) {
            alert('Please enter a room name');
            return;
        }

        const newRoom = {
            id: Date.now().toString(),
            name: roomName,
            creator: currentUser,
            createdAt: new Date().toISOString()
        };

        rooms.push(newRoom);
        localStorage.setItem('chatRooms', JSON.stringify(rooms));

        const roomList = document.getElementById('room-list');
        if (rooms.length === 1) {
            roomList.innerHTML = '';
        }

        const roomHTML = createRoomHTML(newRoom);
        document.getElementById('room-list').insertAdjacentHTML('beforeend', roomHTML);

        roomNameInput.value = '';
    });

    function createRoomHTML(room) {
        const isOwner = room.creator === currentUser;
        const date = new Date(room.createdAt).toLocaleString();

        return `
            <div id="room-${room.id}" class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow hover:scale-[1.01]">
                <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                        <h5 class="font-semibold text-xl text-gray-800">${room.name}</h5>
                        <div class="text-sm text-gray-500 mt-1">Created by ${room.creator} • ${date}</div>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button class="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-md hover:cursor-pointer hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 shadow-sm"
                                onclick="joinRoom('${room.id}')">
                            Join Room
                        </button>
                        ${isOwner ? `
                            <button class="px-4 py-2 bg-gray-500 text-white text-sm shadow-md font-medium rounded-md hover:cursor-pointer hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                                    onclick="editRoom('${room.id}')">
                                Edit
                            </button>
                            <button class="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:cursor-pointer hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                                    onclick="deleteRoom('${room.id}')">
                                Delete
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    window.editRoom = function (roomId) {
        const room = rooms.find(r => r.id === roomId);
        if (!room || room.creator !== currentUser) return;

        const editFormHTML = `
            <div>
                <div class="mb-4">
                    <label for="edit-room-name" class="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                    <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id="edit-room-name" name="roomName" value="${room.name}" required>
                </div>
                <div class="flex justify-end space-x-3 mt-4">
                    <button type="button" class="px-4 py-2 bg-gray-500 text-white shadow-md font-medium rounded-md hover:cursor-pointer hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                            onclick="closeModal()">Cancel</button>
                    <button type="button" class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-md hover:cursor-pointer hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                            onclick="saveRoomEdit('${room.id}')">
                        Save Changes
                    </button>
                </div>
            </div>
        `;

        document.getElementById('edit-room-container').innerHTML = editFormHTML;
        openModal();
    };

    window.saveRoomEdit = function (roomId) {
        const roomName = document.getElementById('edit-room-name').value.trim();
        if (!roomName) {
            alert('Please enter a room name');
            return;
        }

        const roomIndex = rooms.findIndex(r => r.id === roomId);
        if (roomIndex !== -1 && rooms[roomIndex].creator === currentUser) {
            rooms[roomIndex].name = roomName;
            localStorage.setItem('chatRooms', JSON.stringify(rooms));

            loadRooms();
            closeModal();
        }
    };

    window.deleteRoom = function (roomId) {
        if (!confirm('Are you sure you want to delete this room?')) return;

        const roomIndex = rooms.findIndex(r => r.id === roomId);

        if (roomIndex !== -1 && rooms[roomIndex].creator === currentUser) {
            rooms.splice(roomIndex, 1);

            localStorage.setItem('chatRooms', JSON.stringify(rooms));

            const roomElement = document.getElementById(`room-${roomId}`);
            if (roomElement) roomElement.remove();

            if (rooms.length === 0) {
                document.getElementById('room-list').innerHTML =
                    '<div class="text-gray-500 text-center py-8">No rooms available. Create one!</div>';
            }
        }
    };

    function loadRooms() {
        const roomList = document.getElementById('room-list');

        roomList.innerHTML = '';

        if (rooms.length === 0) {
            roomList.innerHTML = '<div class="text-gray-500 text-center py-8">No rooms available. Create one!</div>';
            return;
        } else {
            rooms.forEach(room => {
                const roomHTML = createRoomHTML(room);
                roomList.insertAdjacentHTML('beforeend', roomHTML);
            });
        }
    }

    loadRooms();
});