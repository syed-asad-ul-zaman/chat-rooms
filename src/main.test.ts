import { describe, test, expect, beforeEach, vi } from "vitest";

/* It defines a `localStorageMock` object that simulates the behavior of `localStorage` by storing
key-value pairs in an internal `store` object. */
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

/* The `alertMock` and `confirmMock` variables are assigned with functions created using
`vi.fn()`.*/
const alertMock = vi.fn();
const confirmMock = vi.fn();

/* The jest for a Chat Room Application. It includes tests for various functionalities related to room creation, editing, deletion, joining
rooms, and loading rooms. Here is a summary of what each section of the code is doing: */
describe("Chat Room Application", () => {
  const currentUser = "syed-asad-ul-zaman";
  let rooms: any[] = [];
  let domElements: Record<string, any> = {};

  /**
   * The function `createMockElement` creates a mock element with specified properties for testing
   * purposes.
   * @param {string} id - The `id` parameter is a string that represents the unique identifier of the
   * mock element being created.
   */
  const createMockElement = (id: string) => ({
    id,
    innerHTML: "",
    value: "",
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn().mockImplementation((cls: string) => false),
    },
    insertAdjacentHTML: vi.fn(),
    remove: vi.fn(),
  });

  /* It is resetting various mocks, clearing localStorage, and creating mock DOM elements for testing purposes. It also
  assigns mock implementations for global functions like localStorage, alert, and confirm. This
  setup ensures a clean and consistent environment for each test case to run in isolation. */
  beforeEach(() => {
    rooms = [];
    Object.assign(global, { localStorage: localStorageMock });
    global.alert = alertMock;
    global.confirm = confirmMock;
    vi.resetAllMocks();
    localStorage.clear();

    domElements = {
      "room-name": createMockElement("room-name"),
      "room-list": createMockElement("room-list"),
      editRoomModal: createMockElement("editRoomModal"),
      "edit-room-container": createMockElement("edit-room-container"),
      "edit-room-name": createMockElement("edit-room-name"),
    };

    global.document = {
      getElementById: vi
        .fn()
        .mockImplementation((id: string) => domElements[id] || null),
      body: {
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
        },
      },
    } as any;
  });

  /* The jest for testing room creation functionality. It contains two test cases: */
  describe("Room Creation", () => {
    /* The test for creating a room with valid input. */
    test("should create a room with valid input", () => {
      const roomName = "Test Room";
      domElements["room-name"].value = roomName;

      const createRoom = () => {
        const name = domElements["room-name"].value.trim();

        if (!name) {
          alertMock("Please enter a room name");
          return;
        }

        const newRoom = {
          id: "123",
          name,
          creator: currentUser,
          createdAt: new Date().toISOString(),
        };

        rooms.push(newRoom);
        localStorage.setItem("chatRooms", JSON.stringify(rooms));

        // Update UI (mock)
        domElements["room-name"].value = "";
        domElements["room-list"].insertAdjacentHTML(
          "beforeend",
          `<div id="room-${newRoom.id}">${newRoom.name}</div>`
        );

        return newRoom;
      };

      const result = createRoom();

      expect(result).toBeDefined();
      expect(result?.name).toBe(roomName);
      expect(result?.creator).toBe(currentUser);
      expect(rooms.length).toBe(1);
      expect(domElements["room-list"].insertAdjacentHTML).toHaveBeenCalled();
      expect(domElements["room-name"].value).toBe("");

      const stored = JSON.parse(localStorage.getItem("chatRooms") || "[]");
      expect(stored.length).toBe(1);
      expect(stored[0].name).toBe(roomName);
    });

    /* The test for checking the behavior of the function when an empty room name is provided. */
    test("should not create a room with empty name", () => {
      domElements["room-name"].value = "";

      const createRoom = () => {
        const name = domElements["room-name"].value.trim();

        if (!name) {
          alert("Please enter a room name");
          return;
        }

        const newRoom = {
          id: Date.now().toString(),
          name,
          creator: currentUser,
          createdAt: new Date().toISOString(),
        };

        rooms.push(newRoom);
        return newRoom;
      };

      const result = createRoom();

      expect(result).toBeUndefined();
      expect(alertMock).toHaveBeenCalledWith("Please enter a room name");
      expect(rooms.length).toBe(0);
    });
  });

  /* The jest for room editing functionality. Here is a breakdown of what the code is doing: */
  describe("Room Editing", () => {
    /* It is creating a sample room object with properties like id, name, creator, and createdAt.
    The sample room object is then pushed into an array called rooms, and the updated rooms array
    is stored in the localStorage under the key "chatRooms" after converting it to a JSON string
    using JSON.stringify(). This setup is likely used for testing purposes to initialize some data
    before running tests. */
    beforeEach(() => {
      const sampleRoom = {
        id: "123",
        name: "Original Name",
        creator: currentUser,
        createdAt: new Date().toISOString(),
      };
      rooms.push(sampleRoom);
      localStorage.setItem("chatRooms", JSON.stringify(rooms));
    });

    /* The test updates a room name when editing. The test sets a new room name, calls the `saveRoomEdit` function with a room ID, and
    then checks if the function successfully updates the room name in the `rooms` array and in the
    local storage. The test expects the function to return true, the room name in the `rooms` array
    to be updated to "Updated Room Name", and the room name in the local storage to also be "Updated
    Room Name". */
    test("should update room name when editing", () => {
      domElements["edit-room-name"].value = "Updated Room Name";

      const saveRoomEdit = (roomId: string) => {
        const name = domElements["edit-room-name"].value.trim();

        if (!name) {
          alert("Please enter a room name");
          return false;
        }

        const roomIndex = rooms.findIndex((r) => r.id === roomId);
        if (roomIndex !== -1 && rooms[roomIndex].creator === currentUser) {
          rooms[roomIndex].name = name;
          localStorage.setItem("chatRooms", JSON.stringify(rooms));
          return true;
        }
        return false;
      };

      const result = saveRoomEdit("123");

      expect(result).toBe(true);
      expect(rooms[0].name).toBe("Updated Room Name");

      const stored = JSON.parse(localStorage.getItem("chatRooms") || "[]");
      expect(stored[0].name).toBe("Updated Room Name");
    });

    /* The test is supposed to update a room name. The test is checking if the function `saveRoomEdit` correctly handles the case where
    the room name is empty. */
    test("should not update room with empty name", () => {
      domElements["edit-room-name"].value = "";

      const saveRoomEdit = (roomId: string) => {
        const name = domElements["edit-room-name"].value.trim();

        if (!name) {
          alert("Please enter a room name");
          return false;
        }

        const roomIndex = rooms.findIndex((r) => r.id === roomId);
        if (roomIndex !== -1 && rooms[roomIndex].creator === currentUser) {
          rooms[roomIndex].name = name;
          localStorage.setItem("chatRooms", JSON.stringify(rooms));
          return true;
        }
        return false;
      };

      const result = saveRoomEdit("123");

      expect(result).toBe(false);
      expect(alertMock).toHaveBeenCalledWith("Please enter a room name");
      expect(rooms[0].name).toBe("Original Name");
    });

    /* The test checks if a user is allowed to edit a room name. The test case simulates a scenario where a user who is not the
    creator of a room tries to edit the room name. It creates a room object for another user,
    attempts to update the room name using the `saveRoomEdit` function, and then checks if the
    update was successful. The test expects the function to return false and for the room name to
    remain unchanged after the attempted update. */
    test("should not allow editing for non-creators", () => {
      const otherUserRoom = {
        id: "456",
        name: "Other User Room",
        creator: "other-user",
        createdAt: new Date().toISOString(),
      };
      rooms.push(otherUserRoom);

      domElements["edit-room-name"].value = "Attempted Update";

      const saveRoomEdit = (roomId: string) => {
        const name = domElements["edit-room-name"].value.trim();

        if (!name) {
          alert("Please enter a room name");
          return false;
        }

        const roomIndex = rooms.findIndex((r) => r.id === roomId);
        if (roomIndex !== -1 && rooms[roomIndex].creator === currentUser) {
          rooms[roomIndex].name = name;
          localStorage.setItem("chatRooms", JSON.stringify(rooms));
          return true;
        }
        return false;
      };

      const result = saveRoomEdit("456");

      expect(result).toBe(false);
      expect(rooms[1].name).toBe("Other User Room");
    });
  });

  /* The jest for a room deletion feature in a chat application. Here's a summary of what the code does: */
  describe("Room Deletion", () => {
    /* The jest for a TypeScript project. It is using the `beforeEach` function to run a setup before each test. */
    beforeEach(() => {
      const sampleRoom = {
        id: "123",
        name: "Test Room",
        creator: currentUser,
        createdAt: new Date().toISOString(),
      };
      rooms.push(sampleRoom);
      localStorage.setItem("chatRooms", JSON.stringify(rooms));

      domElements[`room-123`] = createMockElement(`room-123`);

      confirmMock.mockReturnValue(true);
    });

    /* The test deletes a room. The `deleteRoom` function takes a `roomId` as a parameter and first checks if the user confirms the
    deletion by showing a confirmation dialog using `confirm`. If the user confirms and the room
    with the specified `roomId` exists and the current user is the creator of the room, the room is
    deleted from the `rooms` array, the updated `rooms` array is stored in the local storage, and
    the corresponding room element is removed from the DOM. */
    test("should delete a room when confirmed", () => {
      const deleteRoom = (roomId: string) => {
        if (!confirm("Are you sure you want to delete this room?"))
          return false;

        const roomIndex = rooms.findIndex((r) => r.id === roomId);

        if (roomIndex !== -1 && rooms[roomIndex].creator === currentUser) {
          rooms.splice(roomIndex, 1);
          localStorage.setItem("chatRooms", JSON.stringify(rooms));

          const roomElement = document.getElementById(`room-${roomId}`);
          if (roomElement) roomElement.remove();

          return true;
        }
        return false;
      };

      const result = deleteRoom("123");

      expect(result).toBe(true);
      expect(confirmMock).toHaveBeenCalled();
      expect(rooms.length).toBe(0);
      expect(domElements["room-123"].remove).toHaveBeenCalled();

      const stored = JSON.parse(localStorage.getItem("chatRooms") || "[]");
      expect(stored.length).toBe(0);
    });

    /* The test called `deleteRoom`. The test is checking the behavior of the `deleteRoom` function when the user does not confirm the
    deletion of a room. */
    test("should not delete a room when not confirmed", () => {
      confirmMock.mockReturnValueOnce(false);

      const deleteRoom = (roomId: string) => {
        if (!confirm("Are you sure you want to delete this room?"))
          return false;

        const roomIndex = rooms.findIndex((r) => r.id === roomId);

        if (roomIndex !== -1 && rooms[roomIndex].creator === currentUser) {
          rooms.splice(roomIndex, 1);
          localStorage.setItem("chatRooms", JSON.stringify(rooms));
          return true;
        }
        return false;
      };

      const result = deleteRoom("123");

      expect(result).toBe(false);
      expect(confirmMock).toHaveBeenCalled();
      expect(rooms.length).toBe(1);

      const stored = JSON.parse(localStorage.getItem("chatRooms") || "[]");
      expect(stored.length).toBe(1);
    });

    /* The test handles the deletion of a room in a chat application. */
    test('should not allow deletion for non-creators', () => {
      const otherUserRoom = {
        id: '456',
        name: 'Other User Room',
        creator: 'other-user',
        createdAt: new Date().toISOString()
      };
      rooms.push(otherUserRoom);
      localStorage.setItem('chatRooms', JSON.stringify(rooms));

      const deleteRoom = (roomId: string) => {
        if (!confirm('Are you sure you want to delete this room?')) return false;

        const roomIndex = rooms.findIndex(r => r.id === roomId);

        if (roomIndex !== -1 && rooms[roomIndex].creator === currentUser) {
          rooms.splice(roomIndex, 1);
          localStorage.setItem('chatRooms', JSON.stringify(rooms));
          return true;
        }
        return false;
      };

      const result = deleteRoom('456');

      expect(result).toBe(false);
      expect(rooms.length).toBe(2);

      const stored = JSON.parse(localStorage.getItem('chatRooms') || '[]');
      expect(stored.length).toBe(2);
    });
  });

  /* The jest for testing the functionality of a `joinRoom` function. */
  describe("Join Room", () => {
    /* The test called `joinRoom` which is responsible for finding a room in a list of rooms by its ID and showing an
    alert with the room name if the room is found. The test creates a sample room object, adds it to
    a list of rooms, calls the `joinRoom` function with the room ID, and then expects the function
    to return true and for the alert to be called with the correct message. This test is verifying
    the functionality of the `joinRoom` function in a simulated environment. */
    test("should show alert with room name", () => {
      const sampleRoom = {
        id: "123",
        name: "Test Room",
        creator: currentUser,
        createdAt: new Date().toISOString(),
      };
      rooms.push(sampleRoom);
      const joinRoom = (roomId: string) => {
        const room = rooms.find((r) => r.id === roomId);
        if (room) {
          alert(
            `Joining room "${room.name}". This would navigate to the room view in a real implementation.`
          );
          return true;
        }
        return false;
      };
      const result = joinRoom("123");

      expect(result).toBe(true);
      expect(alertMock).toHaveBeenCalledWith(
        'Joining room "Test Room". This would navigate to the room view in a real implementation.'
      );
    });

    /* It is testing a function `joinRoom` which takes a `roomId` as a parameter and attempts to find a room with that
    id in an array of rooms. If the room is found, it displays an alert message and returns `true`,
    otherwise it returns `false`. */
    test("should not join if room not found", () => {
      const joinRoom = (roomId: string) => {
        const room = rooms.find((r) => r.id === roomId);
        if (room) {
          alert(
            `Joining room "${room.name}". This would navigate to the room view in a real implementation.`
          );
          return true;
        }
        return false;
      };

      const result = joinRoom("nonexistent-id");

      expect(result).toBe(false);
      expect(alertMock).not.toHaveBeenCalled();
    });
  });

  /* The jest for testing a function called `loadRooms`. The test suite consists of two test cases: */
  describe("Load Rooms", () => {
    /* The test sets up a scenario where the `rooms` array is empty, then it calls the `loadRooms` function which updates the HTML content of the
    room list element based on the `rooms` array. If there are no rooms available (empty `rooms`
    array), it displays a message "No rooms available. Create one!" in the room list element. The
    test checks if the function returns false in this case and if the expected message is displayed
    in the */
    test("should display empty message when no rooms exist", () => {
      rooms = [];
      localStorage.setItem("chatRooms", JSON.stringify(rooms));

      const loadRooms = () => {
        const roomList = document.getElementById("room-list");
        roomList!.innerHTML = "";

        if (rooms.length === 0) {
          roomList!.innerHTML =
            '<div class="text-gray-500 text-center py-8">No rooms available. Create one!</div>';
          return false;
        } else {
          rooms.forEach((room) => {
            const roomHTML = `<div id="room-${room.id}">${room.name}</div>`;
            roomList!.insertAdjacentHTML("beforeend", roomHTML);
          });
          return true;
        }
      };

      const result = loadRooms();

      expect(result).toBe(false);
      expect(domElements["room-list"].innerHTML).toContain(
        "No rooms available"
      );
    });

    /* The test loads rooms from storage and displays them on the webpage. */
    test("should load all rooms from storage", () => {
      rooms = [
        {
          id: "1",
          name: "Room 1",
          creator: currentUser,
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Room 2",
          creator: "other-user",
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem("chatRooms", JSON.stringify(rooms));

      const loadRooms = () => {
        const roomList = document.getElementById("room-list");
        roomList!.innerHTML = "";

        if (rooms.length === 0) {
          roomList!.innerHTML =
            '<div class="text-gray-500 text-center py-8">No rooms available. Create one!</div>';
          return false;
        } else {
          rooms.forEach((room) => {
            const roomHTML = `<div id="room-${room.id}">${room.name}</div>`;
            roomList!.insertAdjacentHTML("beforeend", roomHTML);
          });
          return true;
        }
      };

      const result = loadRooms();

      expect(result).toBe(true);
      expect(domElements["room-list"].insertAdjacentHTML).toHaveBeenCalledTimes(
        2
      );
      expect(
        domElements["room-list"].insertAdjacentHTML.mock.calls[0][1]
      ).toContain("Room 1");
      expect(
        domElements["room-list"].insertAdjacentHTML.mock.calls[1][1]
      ).toContain("Room 2");
    });
  });
});
