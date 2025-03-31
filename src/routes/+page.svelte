<script lang="ts">
  import {
    GradientButton,
    Card,
    Button,
    ButtonGroup,
    Avatar,
    Label,
    Input,
    Helper,
    Alert,
    Range,
    Spinner,
  } from "flowbite-svelte";
  import {
    WandMagicSparklesOutline,
    ChevronDownOutline,
    ChevronUpOutline,
    ExclamationCircleSolid,
    InfoCircleSolid,
    BanOutline,
    LockOutline,
    HeartOutline,
    PenNibOutline,
    CloseOutline,
    CheckOutline,
    TrashBinOutline,
    UndoOutline,
  } from "flowbite-svelte-icons";

  import type { Staff, Schedule } from "./type";

  const apiUrl = import.meta.env.VITE_API_URL;

  let daysCount = $state(0);
  let shiftCount = $state(0);
  let minStaff = $state(0);
  let maxStaff = $state(0);
  let empCount = $state(0);
  let minShift = $state(0);
  let maxShift = $state(0);

  const weekday = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  let days = $derived(weekday.slice(0, daysCount));
  let shifts = $derived(
    Array.from({ length: shiftCount }, (_, i) => `Shift ${i + 1}`),
  );

  let staffs = $state<Staff[]>([]);
  $effect(() => {
    if (staffs.length < empCount) {
      for (let i = staffs.length; i < empCount; i++) {
        staffs.push({
          id: i,
          name: `Employee ${i + 1}`,
          unavailable: [],
          preferred: [],
          assigned: [],
          isOkay: false,
        });
      }
    } else if (staffs.length > empCount) {
      staffs = staffs.slice(0, empCount);
    }
  });
  $effect(() => {
    if (staffs.length === 0 && empCount > 0) {
      for (let i = 0; i < empCount; i++) {
        staffs.push({
          id: i,
          name: `Employee ${i + 1}`,
          unavailable: [],
          preferred: [],
          assigned: [],
          isOkay: false,
        });
      }
    }
  });

  const isValidDaysCount = $derived(daysCount >= 1 && daysCount <= 7);
  const isValidShiftCount = $derived(shiftCount >= 1 && shiftCount <= 24);

  let schedules = $state<Schedule[]>([]);
  let scheduleCount = $derived(daysCount * shiftCount);
  $effect(() => {
    if (isValidDaysCount && isValidShiftCount) {
      if (schedules.length === 0) {
        for (let i = 0; i < shifts.length; i++) {
          for (let j = 0; j < days.length; j++) {
            schedules.push({
              id: `${shifts[i]}${days[j]}`,
              name: shifts[i],
              day: days[j],
              assigned: [],
              preferred: [],
              unavailable: [],
              isOkay: false,
              isLocked: false,
            });
          }
        }
      } else if (
        schedules.length < scheduleCount ||
        schedules.length > scheduleCount
      ) {
        let newSchedule: Schedule[] = [];
        for (let i = 0; i < shifts.length; i++) {
          for (let j = 0; j < days.length; j++) {
            newSchedule.push({
              id: `${shifts[i]}-${days[j]}`,
              name: shifts[i],
              day: days[j],
              assigned: [],
              preferred: [],
              unavailable: [],
              isOkay: false,
              isLocked: false,
            });
          }
        }
        schedules = newSchedule;
      }
    } else {
      schedules = [];
    }
  });

  let empSessionExpanded = $state(false);
  let toolMode = $state("none");
  let selectedEmp = $state<number>();

  $effect(() => {
    for (let i = 0; i < staffs.length; i++) {
      if (staffs[i].assigned.length < minShift) {
        staffs[i].isOkay = false;
      } else if (staffs[i].assigned.length > maxShift) {
        staffs[i].isOkay = false;
      } else {
        staffs[i].isOkay = true;
      }
    }
  });

  let resetDisable = $state(true);

  let magicDisable = $state(true);
  $effect(() => {
    if (
      daysCount > 0 &&
      shiftCount > 0 &&
      empCount > 0 &&
      minShift > 0 &&
      maxShift > 0 &&
      maxStaff > 0
    ) {
      magicDisable = false;
    }
  });

  let isLoading = $state(false);
  let error = $state<string | null>(null);

  function updateStaffs() {
    staffs = staffs.map((staff) => {
      const assignedShifts = schedules
        .filter((schedule) => schedule.assigned.includes(staff.id))
        .map((schedule) => `${schedule.name}-${schedule.day}`);
      return { ...staff, assigned: assignedShifts };
    });
  }

  async function magic() {
    isLoading = true;
    error = null;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          staffs: staffs,
          schedules: schedules,
          minStaff: minStaff,
          maxStaff: maxStaff,
          minShift: minShift,
          maxShift: maxShift,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save package");
      }

      const data = await response.json();

      schedules = data.schedules;
      updateStaffs();
    } catch (err) {
      console.error("Error:", (err as Error).message);
      error = (err as Error).message;
    } finally {
      isLoading = false;
      resetDisable = false;
    }
  }
</script>

<main class="grid grid-cols-12 min-h-screen">
  <div
    class="flex flex-col gap-4 col-span-3 bg-white border-r border-r-neutral-200 p-6"
  >
    <h2 class="text-lg font-semibold text-gray-800 mb-2">Basic Info</h2>
    <div class="mb-1 flex flex-col gap-1 w-full">
      <Label class="block mb-1 text-base font-normal"
        >How many working days per week? <span class="text-base font-semibold">
          {daysCount}</span
        ></Label
      >
      <Range bind:value={daysCount} min="0" max="7" class="w-full" />
      {#if daysCount < 0 || daysCount > 7}
        <Helper class="mt-2" color="red"
          ><span class="font-medium">Invalid input!</span> Please input number from
          1-7.</Helper
        >
      {/if}
    </div>
    <div class="mb-1 flex flex-col gap-1 w-full">
      <Label class="block mb-1 text-base font-normal"
        >How many shifts per day?</Label
      >
      <Input
        type="number"
        bind:value={shiftCount}
        placeholder="Enter number"
        min="0"
        max="12"
        class="w-full"
      />
      {#if shiftCount < 0 || shiftCount > 24}
        <Helper class="mt-2" color="red"
          ><span class="font-medium">Invalid input!</span> Please input number from
          1-24.</Helper
        >
      {/if}
    </div>
    <div class="mb-1 flex flex-col gap-1 w-full">
      <Label class="block mb-1 text-base font-normal"
        >How many employees do you have?</Label
      >
      <Input
        type="number"
        bind:value={empCount}
        placeholder="Enter number"
        min="0"
        max="60"
        class="w-full"
      />
      {#if empCount < 0}
        <Helper class="mt-2" color="red"
          ><span class="font-medium">Invalid input!</span></Helper
        >
      {/if}
      {#if empCount > 60}
        <Helper class="mt-2" color="red"
          ><span class="font-medium"
            >We currently only support under 60 staffs total.</span
          ></Helper
        >
      {/if}
    </div>
    <div class="mb-1 flex flex-col gap-1 w-full">
      <Label class="block mb-1 text-base font-normal"
        >Minimum staff required each shift?</Label
      >
      <Input
        type="number"
        bind:value={minStaff}
        placeholder="Enter number"
        min="0"
        max={empCount}
        class="w-full"
      />
      {#if minStaff < 0}
        <Helper class="mt-2" color="red"
          ><span class="font-medium">Invalid input!</span></Helper
        >
      {/if}
    </div>
    <div class="mb-1 flex flex-col gap-1 w-full">
      <Label class="block mb-1 text-base font-normal"
        >Maximum staff allowed each shift?</Label
      >
      <Input
        type="number"
        bind:value={maxStaff}
        placeholder="Enter number"
        min="0"
        max={empCount}
        class="w-full"
      />
      {#if maxStaff < 0}
        <Helper class="mt-2" color="red"
          ><span class="font-medium">Invalid input!</span></Helper
        >
      {/if}
    </div>
    <div class="mb-1 flex flex-col gap-1 w-full">
      <Label class="block mb-1 text-base font-normal"
        >Minimum shift required for each staff everyweek?</Label
      >
      <Input
        type="number"
        bind:value={minShift}
        placeholder="Enter number"
        min="0"
        class="w-full"
      />
      {#if minShift < 0}
        <Helper class="mt-2" color="red"
          ><span class="font-medium">Invalid input!</span></Helper
        >
      {/if}
    </div>
    <div class="mb-1 flex flex-col gap-1 w-full">
      <Label class="block mb-1 text-base font-normal"
        >Maximum shift allowed for each staff everyweek?</Label
      >
      <Input
        type="number"
        bind:value={maxShift}
        placeholder="Enter number"
        min="0"
        max={daysCount * shiftCount}
        class="w-full"
      />
      {#if maxShift < 0}
        <Helper class="mt-2" color="red"
          ><span class="font-medium">Invalid input!</span></Helper
        >
      {/if}
    </div>
    <GradientButton
      color="pinkToOrange"
      size="lg"
      class={`mt-2 cursor-pointer ${magicDisable && "hover:bg-gray-100 bg-gray-100 cursor-not-allowed"}`}
      disabled={magicDisable || isLoading}
      on:click={magic}
    >
      {#if isLoading}
        <Spinner class="me-2" size="4" color="white" />
        Scheduling...
      {:else}
        <WandMagicSparklesOutline class="w-5 h-5 me-2" />
        Magic Schedule
      {/if}
    </GradientButton>
    <Label class="block mb-1 text-base font-normal"
      >Note: Due to limited cloud service computing resource, auto-scheduling
      will take longer than it is supposed to be.</Label
    >
  </div>
  <div class="flex flex-col col-span-9 gap-6 p-6 bg-gray-100">
    {#if minStaff * daysCount * shiftCount > empCount * maxShift}
      <Alert class="text-sm font-normal">
        <ExclamationCircleSolid slot="icon" class="w-5 h-5" />
        <span class="text-sm font-semibold">Impossible requirements!</span>
        Number of shifts for current staffs to work is more than the staffs can handle.
      </Alert>
    {/if}
    {#if daysCount !== 0 && shiftCount !== 0 && maxStaff !== 0 && empCount !== 0 && maxShift !== 0}
      <Alert class="text-sm font-normal cursor-default" color="blue">
        <InfoCircleSolid slot="icon" class="w-5 h-5" />
        <span class="text-sm font-semibold"
          >This is the manual schedule panel.</span
        >
        Select each employee from the Employees section, then select a mode from
        the toolbar: Prefer mode for selecting preferred shifts, Unavailable for
        selecting shifts that the employee can not work, Assign mode is self-explanatory.
        Finally, go ahead and click on the shifts on the schedule to set it.
      </Alert>
    {/if}
    {#if staffs.length > 0 && empCount <= 60}
      <div
        class={`is-expandable flex flex-col p-5 gap-4 bg-white rounded-lg overflow-clip ${empSessionExpanded ? "" : "h-52"}`}
      >
        <div class="flex justify-between items-start">
          <div class="flex gap-3 items-center">
            <h2 class="text-lg font-semibold text-gray-800">Your Employees</h2>
            {#if selectedEmp !== undefined}
              <p class="text-sm font-normal pt-1">
                Selecting: <span class={`text-sm font-medium text-primary-700`}
                  >{staffs[selectedEmp].name}</span
                >
              </p>
            {/if}
          </div>
          <Button
            outline
            color="alternative"
            on:click={() => (empSessionExpanded = !empSessionExpanded)}
            class="hover:bg-gray-50 focus-within:bg-white hover:text-gray-900 focus-within:text-gray-900 focus-within:ring-0 focus-within:outline-0 focus-visible:outline-0 focus-visible:ring-0 border-0 px-2"
          >
            {#if empSessionExpanded}
              <ChevronUpOutline class="w-5 h-5" />
            {:else}
              <ChevronDownOutline class="w-5 h-5" />
            {/if}
          </Button>
        </div>
        <div class="flex flex-wrap gap-2 rounded-2xl w-full">
          {#each staffs as staff, i}
            <Card
              class={`cursor-pointer flex p-4 gap-2 max-w-[218px] flex-row shadow-none min-w-fit hover:border-primary-400 hover:border hover:bg-neutral-50 transition-all duration-500 ease-out force-padding-16 ${selectedEmp === staff.id && "border-primary-500"}`}
              on:click={() => {
                selectedEmp = staff.id;
              }}
            >
              <Avatar class="shrink-0" />
              <div class="flex flex-col gap-1 w-fit shrink-0">
                <input
                  type="text"
                  bind:value={staff.name}
                  class="cursor-text max-w-[120px] bg-transparent border-none outline-none caret-black focus:ring-0 p-0 text-sm text-gray-900 font-normal hover:bg-primary-50"
                />
                <div
                  id="tooltip-employee-trigger"
                  class="flex items-center gap-1"
                >
                  <div
                    class="p-1 flex flex-col items-center gap-[2px] rounded-3xl bg-blue-50 text-blue-800 text-sm"
                  >
                    <HeartOutline class="w-4 h-4" />
                    <p>{staff.preferred.length}</p>
                  </div>
                  <div
                    class="p-1 flex flex-col items-center gap-[2px] rounded-3xl bg-rose-50 text-rose-800 text-sm"
                  >
                    <BanOutline class="w-4 h-4" />
                    <p>{staff.unavailable.length}</p>
                  </div>
                  <div
                    class={`p-1 flex flex-col items-center gap-[2px]  rounded-3xl ${staff.isOkay ? "text-green-800 bg-green-50" : "text-gray-800 bg-gray-50"} text-sm`}
                  >
                    <CheckOutline class="w-4 h-4" />
                    <p>{staff.assigned.length}</p>
                  </div>
                </div>
              </div>
            </Card>
          {/each}
        </div>
      </div>
    {/if}
    <div class="flex flex-col p-5 gap-4 bg-white rounded-lg">
      <div class="flex justify-between">
        <div class="flex flex-col gap-1">
          <h2 class="text-lg font-semibold text-gray-800">
            This Week Schedule
          </h2>
          <div class="flex items-center gap-2">
            <p class="text-sm font-normal">
              Current mode: <span
                class={`text-sm font-medium ${toolMode === "none" ? "text-gray-500" : "text-primary-700"}`}
                >{toolMode}</span
              >
            </p>
            {#if toolMode !== "none"}
              <button
                onclick={() => {
                  toolMode = "none";
                }}
              >
                <CloseOutline class="w-4 h-4 text-primary-700 cursor-pointer" />
              </button>
            {/if}
          </div>
        </div>
        <ButtonGroup class="*:ring-primary-700! shadow-none drop-shadow-none">
          <Button
            size="md"
            class={`cursor-pointer h-11 border-1 focus-within:ring-0 ${toolMode === "Remove" ? "text-primary-700 bg-primary-50 border-primary-300" : "text-gray-600 border-gray-200"}`}
            on:click={() => {
              toolMode = "Remove";
            }}
          >
            <TrashBinOutline class="w-4 h-4 me-2" />
            Remove
          </Button>
          <Button
            size="md"
            class={`cursor-pointer h-11 border-1 focus-within:ring-0 ${toolMode === "Prefer" ? "text-primary-700 bg-primary-50 border-primary-300" : "text-gray-600 border-gray-200"}`}
            on:click={() => {
              toolMode = "Prefer";
            }}
          >
            <HeartOutline class="w-4 h-4 me-2" />
            Prefer
          </Button>
          <Button
            size="md"
            class={`cursor-pointer h-11 border-1 focus-within:ring-0 ${toolMode === "Unavailable" ? "text-primary-700 bg-primary-50 border-primary-300" : "text-gray-600 border-gray-200"}`}
            on:click={() => {
              toolMode = "Unavailable";
            }}
          >
            <BanOutline class="w-4 h-4 me-2" />
            Unavailable
          </Button>
          <Button
            size="md"
            class={`cursor-pointer h-11 border-1 focus-within:ring-0 ${toolMode === "Lock" ? "text-primary-700 bg-primary-50 border-primary-300" : "text-gray-600 border-gray-200"}`}
            on:click={() => {
              toolMode = "Lock";
            }}
          >
            <LockOutline class="w-4 h-4 me-2" />
            Lock/Unlock
          </Button>
          <Button
            size="md"
            class={`cursor-pointer h-11 border-1 focus-within:ring-0 ${toolMode === "Assign" ? "text-primary-700 bg-primary-50 border-primary-300" : "text-gray-600 border-gray-200"}`}
            on:click={() => {
              toolMode = "Assign";
            }}
          >
            <PenNibOutline class="w-4 h-4 me-2" />
            Assign
          </Button>
        </ButtonGroup>
      </div>
      {#if isValidDaysCount && isValidShiftCount}
        <table
          class={`w-full cursor-default ${isLoading && "pointer-events-none opacity-20"}`}
        >
          <thead>
            <tr>
              <th class="text-neutral-500 font-normal">Shifts</th>
              {#each days as day, i}
                <th>{day}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each shifts as shift, i}
              <tr>
                <td>
                  <input
                    type="text"
                    bind:value={shifts[i]}
                    class="cursor-text max-w-[120px] bg-transparent border-none outline-none caret-black focus:ring-0 p-0 text-base text-gray-700 font-normal hover:bg-primary-50"
                  />
                </td>
                {#each days as day, j}
                  <td
                    onclick={() => {
                      if (!isLoading) {
                        // prettier-ignore
                        const schedule = schedules.find((item) => item.day === day && item.name === shift);
                        /* prettier-ignore-start */
                        // prettier-ignore
                        if (toolMode === "Assign" && schedule && !schedule.assigned.includes(selectedEmp as number) && !schedule.unavailable.includes(selectedEmp as number) && schedule.isLocked === false) {
                          schedule.assigned.push(selectedEmp as number);
                          staffs.find((item) => item.id === selectedEmp)?.assigned.push(`${shift}-${day}`);
                        } else if (toolMode === "Unavailable" && schedule && !schedule.unavailable.includes(selectedEmp as number) && !schedule.preferred.includes(selectedEmp as number) && schedule.isLocked === false) {
                          schedule.unavailable.push(selectedEmp as number);
                          staffs.find((item) => item.id === selectedEmp)?.unavailable.push(`${shift}-${day}`);
                        } else if (toolMode === "Prefer" && schedule && !schedule.preferred.includes(selectedEmp as number) && !schedule.unavailable.includes(selectedEmp as number) && schedule.isLocked === false) {
                          schedule.preferred.push(selectedEmp as number);
                          staffs.find((item) => item.id === selectedEmp)?.preferred.push(`${shift}-${day}`);
                        } else if (toolMode === "Remove" && schedule && schedule.isLocked === false) {
                          if (schedule.assigned.includes(selectedEmp as number)) {
                            let index1 = schedule?.assigned.indexOf(selectedEmp as number);
                            let index2 = staffs.find((item) => item.id === selectedEmp)?.assigned.indexOf(`${shift}-${day}`) as number;
                            schedule?.assigned.splice(index1, 1);
                            staffs.find((item) => item.id === selectedEmp)?.assigned.splice(index2, 1);
                          } else if (schedule.unavailable.includes(selectedEmp as number)) {
                            let index1 = schedule?.unavailable.indexOf(selectedEmp as number);
                            let index2 = staffs.find((item) => item.id === selectedEmp)?.unavailable.indexOf(`${shift}-${day}`) as number;
                            schedule?.unavailable.splice(index1, 1);
                            staffs.find((item) => item.id === selectedEmp)?.unavailable.splice(index2, 1);
                          } else if (schedule.preferred.includes(selectedEmp as number)) {
                            let index1 = schedule?.preferred.indexOf(selectedEmp as number);
                            let index2 = staffs.find((item) => item.id === selectedEmp)?.preferred.indexOf(`${shift}-${day}`) as number;
                            schedule?.preferred.splice(index1, 1);
                            staffs.find((item) => item.id === selectedEmp)?.preferred.splice(index2, 1);
                          }
                        } else if (toolMode === "Lock") {
                          if (schedule?.isLocked === false) {
                            schedule.isLocked = true
                          } else if (schedule?.isLocked === true) {
                            schedule.isLocked = false
                          }
                        }
                        resetDisable = false;
                        /* prettier-ignore-end */
                      }
                    }}
                    class={`hover:bg-gray-50! gap-2 ${(selectedEmp === undefined || toolMode === "none") && toolMode != "Lock" ? "cursor-not-allowed!" : "cursor-pointer!"} ${schedules.find((item) => item.day === day && item.name === shift)?.unavailable.includes(selectedEmp as number) && "bg-red-100"} ${schedules.find((item) => item.day === day && item.name === shift)?.preferred.includes(selectedEmp as number) && "bg-blue-50"}`}
                  >
                    <div class={`flex flex-col gap-1`}>
                      {#each schedules.find((item) => item.name === shift && item.day === day)?.assigned as number[] as shiftCell}
                        <div
                          class={`p-2 flex gap-1 justify-between items-center rounded-sm bg-gray-200/50 text-sm ${selectedEmp === undefined || toolMode === "none" ? "cursor-not-allowed!" : "cursor-pointer!"}`}
                        >
                          {staffs.find((item) => item.id === shiftCell)?.name}
                        </div>
                      {/each}
                      {#if schedules.find((item) => item.day === day && item.name === shift)?.isLocked === true}
                        <LockOutline
                          class="w-5 h-5 text-primary-800 self-end"
                        />
                      {/if}
                    </div>
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <div class="flex items-center gap-1">
          <ExclamationCircleSolid class={`w-4 h-4 text-rose-700`} />
          <p class={`text-sm font-normal text-rose-800`}>
            Please enter valid number of shift types and working days per week.
          </p>
        </div>
      {/if}
      <Button
        on:click={() => {
          if (!resetDisable) {
            for (let i = 0; i < staffs.length; i++) {
              staffs[i].assigned = [];
              staffs[i].preferred = [];
              staffs[i].unavailable = [];
            }
            for (let i = 0; i < schedules.length; i++) {
              schedules[i].assigned = [];
              schedules[i].preferred = [];
              schedules[i].unavailable = [];
            }
          }
          resetDisable = true;
        }}
        color="light"
        disabled={resetDisable}
        class={`gap-2 max-w-32 self-end ${resetDisable && "hover:bg-white cursor-not-allowed"}`}
      >
        <UndoOutline class="w-4 h-4" />
        Reset
      </Button>
    </div>
  </div>
</main>
