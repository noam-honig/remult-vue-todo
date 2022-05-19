<script setup lang="ts">
import type { ErrorInfo } from 'remult';
import { onMounted, ref } from 'vue'
import { remult, setAuthToken } from './common';
import { AuthController } from './shared/AuthController';
import { Task } from './shared/Task';
import { TasksController } from './shared/TasksController';

const taskRepo = remult.repo(Task);
const tasks = ref<(Task & { error?: ErrorInfo<Task> })[]>([]);
const hideCompleted = ref(false);
const username = ref('');
async function fetchTasks() {
  if (!taskRepo.metadata.apiReadAllowed)
    return;
  tasks.value = await taskRepo.find({
    orderBy: {
      completed: "asc"
    },
    where: {
      completed: hideCompleted.value ? false : undefined
    }

  });
}

async function saveTask(task: (Task & { error?: ErrorInfo<Task> })) {
  try {
    const savedTask = await taskRepo.save(task);
    tasks.value = tasks.value.map(t => t === task ? savedTask : t);
  } catch (error: any) {
    alert(error.message);
    task.error = error;
  }
}
async function deleteTask(task: Task) {
  await taskRepo.delete(task);
  tasks.value = tasks.value.filter(t => t !== task);
}
function addTask() {
  tasks.value.push(new Task());
}

async function setAll(completed: boolean) {
  await TasksController.setAll(completed);
  fetchTasks()
};

const signIn = async () => {
  try {
    setAuthToken(await AuthController.signIn(username.value));
    window.location.reload();
  }
  catch (error: any) {
    alert(error.message);
  }
}

const signOut = () => {
  setAuthToken(null);
  window.location.reload();
}

onMounted(async () => { fetchTasks() })
</script>

<template>
  <template v-if="!remult.authenticated()">
    <p>
      <input v-model="username" />
      <button @click="signIn()">Sign in</button>
    </p>
  </template>
  <template v-if="remult.authenticated()">
    <p>
      Hi {{ remult.user.name }} <button @click="signOut()">Sign out</button>
    </p>
    <input type="checkbox" v-model="hideCompleted" @change="fetchTasks()" /> Hide Completed {{ hideCompleted }}
    <hr />
    <div v-for="task in tasks">
      <input type="checkbox" v-model="task.completed" />
      <input v-model="task.title">
      {{ task.error?.modelState?.title }}
      <button @click="saveTask(task)">Save</button>
      <button @click="deleteTask(task)">Delete</button>
    </div>
    <button @click="addTask()">Add Task</button>
    <div>
      <button @click="setAll(true)">Set all as completed</button>
      <button @click="setAll(false)">Set all as uncompleted</button>
    </div>
  </template>
</template>

<style>
</style>
